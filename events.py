from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import (
    require_any_authenticated_user,
    require_organizer
)
from ..models import (
    Booking,
    BookingStatus,
    Event,
    EventStatus,
    User
)
from ..schemas import (
    BookingResponse,
    EventBookingInsight,
    EventCreate,
    EventResponse,
    EventUpdate
)
from ..services.event_service import (
    notify_event_bookers,
    refresh_event_lifecycle,
    update_all_event_lifecycles
)


# =========================
# Events Router
# =========================

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


# =========================
# Create Event
# ORGANIZER only
# =========================

@router.post(
    "/",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED
)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer)
):
    new_event = Event(
        organizer_id=current_user.id,
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        location=event_data.location,
        event_date=event_data.event_date,
        ticket_price=event_data.ticket_price,
        banner_image=event_data.banner_image,
        total_tickets=event_data.total_tickets,
        available_tickets=event_data.total_tickets,
        event_status=EventStatus.UPCOMING
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


# =========================
# Get All Events
# USER / ORGANIZER / ADMIN
# =========================

@router.get(
    "/",
    response_model=list[EventResponse]
)
def get_events(
    category: str | None = Query(
        default=None,
        description=(
            "Filter by category: "
            "Music, Tech, Sports, Business"
        )
    ),
    search: str | None = Query(
        default=None,
        description="Search events by title"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_authenticated_user
    )
):
    # Automatically refresh lifecycle statuses
    update_all_event_lifecycles(db)

    query = db.query(Event)

    if category:
        query = query.filter(
            Event.category == category
        )

    if search:
        query = query.filter(
            Event.title.ilike(f"%{search}%")
        )

    return (
        query
        .order_by(Event.event_date.asc())
        .all()
    )


# =========================
# Get My Events
# ORGANIZER only
# =========================

@router.get(
    "/my-events",
    response_model=list[EventResponse]
)
def get_my_events(
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    update_all_event_lifecycles(db)

    events = (
        db.query(Event)
        .filter(
            Event.organizer_id == current_user.id
        )
        .order_by(
            Event.event_date.asc()
        )
        .all()
    )

    return events


# =========================
# Organizer Booking Insights
# ORGANIZER only
# =========================

@router.get(
    "/my-events/insights",
    response_model=list[EventBookingInsight]
)
def get_my_event_insights(
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    update_all_event_lifecycles(db)

    events = (
        db.query(Event)
        .filter(
            Event.organizer_id == current_user.id
        )
        .order_by(Event.event_date.asc())
        .all()
    )

    insights = []

    for event in events:
        confirmed_bookings = (
            db.query(Booking)
            .filter(
                Booking.event_id == event.id,
                Booking.booking_status == BookingStatus.CONFIRMED
            )
            .all()
        )

        tickets_sold = sum(
            booking.ticket_quantity
            for booking in confirmed_bookings
        )

        total_revenue = sum(
            booking.total_price
            for booking in confirmed_bookings
        )

        insights.append(
            EventBookingInsight(
                event_id=event.id,
                event_title=event.title,
                total_tickets=event.total_tickets,
                tickets_sold=tickets_sold,
                remaining_tickets=event.available_tickets,
                booking_count=len(confirmed_bookings),
                total_revenue=round(total_revenue, 2)
            )
        )

    return insights


# =========================
# Get Event Bookings
# ORGANIZER only
# =========================

@router.get(
    "/{event_id}/bookings",
    response_model=list[BookingResponse]
)
def get_event_bookings(
    event_id: int,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    refresh_event_lifecycle(event, db)

    # Ownership validation
    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You can only view bookings "
                "for your own events"
            )
        )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.event_id == event_id
        )
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )

    return bookings


# =========================
# Get Event By ID
# USER / ORGANIZER / ADMIN
# =========================

@router.get(
    "/{event_id}",
    response_model=EventResponse
)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_authenticated_user
    )
):
    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    refresh_event_lifecycle(event, db)

    return event


# =========================
# Update Own Event
# ORGANIZER only
# =========================

@router.put(
    "/{event_id}",
    response_model=EventResponse
)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Refresh lifecycle before checking status
    refresh_event_lifecycle(event, db)

    # Ownership validation
    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own events"
        )

    # Cancelled events cannot be edited
    if event.event_status == EventStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancelled events cannot be updated"
        )

    # Ongoing events cannot be edited
    if event.event_status == EventStatus.ONGOING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ongoing events cannot be updated"
        )

    # Completed events cannot be edited
    if event.event_status == EventStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed events cannot be updated"
        )

    update_data = event_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No event fields were provided for update"
        )

    # Keep ticket availability consistent when
    # total ticket capacity is changed.
    if "total_tickets" in update_data:
        booked_tickets = (
            event.total_tickets -
            event.available_tickets
        )

        new_total_tickets = update_data[
            "total_tickets"
        ]

        if new_total_tickets < booked_tickets:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Total tickets cannot be less than "
                    f"already booked tickets ({booked_tickets})"
                )
            )

        event.available_tickets = (
            new_total_tickets -
            booked_tickets
        )

    # Apply updates
    for field, value in update_data.items():
        if field != "total_tickets":
            setattr(event, field, value)

    if "total_tickets" in update_data:
        event.total_tickets = update_data[
            "total_tickets"
        ]

    # Make sure lifecycle is correct if event_date
    # was changed.
    event.event_status = EventStatus.UPCOMING

    db.flush()

    # Notify users who already booked this event.
    notify_event_bookers(
        db=db,
        event=event,
        title="Event Updated",
        message=(
            f"The event '{event.title}' has been updated "
            "by the organizer. Please check the latest "
            "event details."
        )
    )

    db.commit()
    db.refresh(event)

    return event


# =========================
# Cancel Own Event
# ORGANIZER only
# =========================

@router.patch(
    "/{event_id}/cancel",
    response_model=EventResponse
)
def cancel_event(
    event_id: int,
    current_user: User = Depends(require_organizer),
    db: Session = Depends(get_db)
):
    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Refresh lifecycle before checking status
    refresh_event_lifecycle(event, db)

    # Ownership validation
    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own events"
        )

    if event.event_status == EventStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is already cancelled"
        )

    if event.event_status == EventStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed events cannot be cancelled"
        )

    if event.event_status == EventStatus.ONGOING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ongoing events cannot be cancelled"
        )

    event.event_status = EventStatus.CANCELLED

    # Notify users with confirmed bookings
    notify_event_bookers(
        db=db,
        event=event,
        title="Event Cancelled",
        message=(
            f"The event '{event.title}' has been cancelled "
            "by the organizer."
        )
    )

    db.commit()
    db.refresh(event)

    return event