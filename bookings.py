from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_user
from ..models import (
    Booking,
    BookingStatus,
    Event,
    EventStatus,
    Notification,
    NotificationType,
    User
)
from ..schemas import BookingCreate, BookingResponse
from ..services.event_service import update_event_lifecycle


# =========================
# Bookings Router
# =========================

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


# =========================
# Create Booking
# USER only
# =========================

@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    # Find the event
    event = (
        db.query(Event)
        .filter(Event.id == booking_data.event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Automatically update lifecycle
    lifecycle_changed = update_event_lifecycle(event)

    if lifecycle_changed:
        db.commit()
        db.refresh(event)

    # Cancelled events cannot be booked
    if event.event_status == EventStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancelled events cannot be booked"
        )

    # Completed events cannot be booked
    if event.event_status == EventStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed events cannot be booked"
        )

    # Ongoing events cannot be booked
    if event.event_status == EventStatus.ONGOING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ongoing events cannot be booked"
        )

    # Check whether the event is sold out
    if event.available_tickets <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is sold out"
        )

    # Check requested quantity against availability
    if booking_data.ticket_quantity > event.available_tickets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Only {event.available_tickets} "
                "tickets are available"
            )
        )

    # Calculate total price on the backend
    total_price = (
        event.ticket_price *
        booking_data.ticket_quantity
    )

    # Create booking
    new_booking = Booking(
        user_id=current_user.id,
        event_id=event.id,
        ticket_quantity=booking_data.ticket_quantity,
        total_price=total_price,
        booking_status=BookingStatus.CONFIRMED
    )

    # Reduce available tickets
    event.available_tickets -= (
        booking_data.ticket_quantity
    )

    db.add(new_booking)
    db.flush()

    # =========================
    # Create Booking Notification
    # =========================

    notification = Notification(
        user_id=current_user.id,
        title="Booking Confirmed",
        message=(
            f"Your booking for '{event.title}' "
            "has been confirmed. "
            f"You booked {booking_data.ticket_quantity} "
            f"ticket(s) for ₹{total_price:.2f}."
        ),
        type=NotificationType.BOOKING,
        is_read=False
    )

    db.add(notification)

    # Commit booking + notification together
    db.commit()

    db.refresh(new_booking)

    return new_booking


# =========================
# Get My Bookings
# USER only
# =========================

@router.get(
    "/my-bookings",
    response_model=list[BookingResponse]
)
def get_my_bookings(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    bookings = (
        db.query(Booking)
        .filter(
            Booking.user_id == current_user.id
        )
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )

    return bookings


# =========================
# Get Single Booking
# USER only
# =========================

@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(
    booking_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.id == booking_id,
            Booking.user_id == current_user.id
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    return booking
