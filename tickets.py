import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import (
    require_organizer_or_admin,
    require_user
)
from ..models import (
    Booking,
    BookingStatus,
    Event,
    Ticket,
    User
)
from ..schemas import TicketResponse
from ..services.qr_service import generate_qr_code


# =========================
# Tickets Router
# =========================

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)


# =========================
# Build Ticket Response
# =========================

def build_ticket_response(
    ticket: Ticket,
    booking: Booking,
    event: Event
):
    return {
        "id": ticket.id,
        "booking_id": ticket.booking_id,
        "ticket_code": ticket.ticket_code,
        "qr_code_url": ticket.qr_code_url,
        "created_at": ticket.created_at,

        "ticket_quantity": booking.ticket_quantity,
        "total_price": booking.total_price,

        "event_id": event.id,
        "event_title": event.title,
        "event_description": event.description,
        "event_category": event.category,
        "event_location": event.location,
        "event_date": event.event_date,
        "ticket_price": event.ticket_price,
    }


# =========================
# Booking Status Helper
# =========================

def get_booking_status_value(booking_status):
    """
    Safely return the booking status whether SQLAlchemy
    provides an enum object or a string.
    """

    if hasattr(booking_status, "value"):
        return booking_status.value

    return str(booking_status)


# =========================
# Create Ticket
# USER only
# =========================

@router.post(
    "/booking/{booking_id}",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED
)
def create_ticket(
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

    if booking.booking_status != BookingStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Ticket can only be generated "
                "for a confirmed booking"
            )
        )

    event = (
        db.query(Event)
        .filter(
            Event.id == booking.event_id
        )
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Prevent duplicate tickets for the same booking
    existing_ticket = (
        db.query(Ticket)
        .filter(
            Ticket.booking_id == booking.id
        )
        .first()
    )

    if existing_ticket:
        return build_ticket_response(
            existing_ticket,
            booking,
            event
        )

    # Generate unique ticket code
    ticket_code = (
        f"TICKET-{uuid.uuid4().hex[:12].upper()}"
    )

    # Generate QR code
    qr_code_path = generate_qr_code(
        ticket_code
    )

    new_ticket = Ticket(
        booking_id=booking.id,
        ticket_code=ticket_code,
        qr_code_url=qr_code_path
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return build_ticket_response(
        new_ticket,
        booking,
        event
    )


# =========================
# Get My Tickets
# USER only
# =========================

@router.get(
    "/my-tickets",
    response_model=list[TicketResponse]
)
def get_my_tickets(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    results = (
        db.query(Ticket, Booking, Event)
        .join(
            Booking,
            Ticket.booking_id == Booking.id
        )
        .join(
            Event,
            Booking.event_id == Event.id
        )
        .filter(
            Booking.user_id == current_user.id
        )
        .order_by(
            Ticket.created_at.desc()
        )
        .all()
    )

    return [
        build_ticket_response(
            ticket,
            booking,
            event
        )
        for ticket, booking, event in results
    ]


# =========================
# Verify Ticket
# ORGANIZER / ADMIN
# =========================

@router.get(
    "/verify/{ticket_code}"
)
def verify_ticket(
    ticket_code: str,
    current_user: User = Depends(
        require_organizer_or_admin
    ),
    db: Session = Depends(get_db)
):
    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.ticket_code == ticket_code
        )
        .first()
    )

    if ticket is None:
        return {
            "valid": False,
            "message": (
                "Invalid ticket. "
                "Ticket not found."
            ),
            "ticket_code": ticket_code
        }

    booking = (
        db.query(Booking)
        .filter(
            Booking.id == ticket.booking_id
        )
        .first()
    )

    if booking is None:
        return {
            "valid": False,
            "message": (
                "Invalid ticket. "
                "Booking not found."
            ),
            "ticket_code": ticket_code
        }

    event = (
        db.query(Event)
        .filter(
            Event.id == booking.event_id
        )
        .first()
    )

    if event is None:
        return {
            "valid": False,
            "message": (
                "Invalid ticket. "
                "Event not found."
            ),
            "ticket_code": ticket_code
        }

    booking_status = get_booking_status_value(
        booking.booking_status
    )

    confirmed_status = get_booking_status_value(
        BookingStatus.CONFIRMED
    )

    if booking_status != confirmed_status:
        return {
            "valid": False,
            "message": (
                "Ticket is not valid because "
                "the booking is not confirmed."
            ),
            "ticket_code": ticket_code,
            "booking_status": booking_status
        }

    return {
        "valid": True,
        "message": "Ticket verified successfully.",
        "ticket_code": ticket.ticket_code,
        "ticket_id": ticket.id,
        "booking_id": booking.id,
        "booking_status": booking_status,
        "ticket_quantity": booking.ticket_quantity,
        "total_price": booking.total_price,
        "event": {
            "id": event.id,
            "title": event.title,
            "category": (
                event.category.value
                if hasattr(event.category, "value")
                else str(event.category)
            ),
            "location": event.location,
            "event_date": event.event_date,
            "ticket_price": event.ticket_price
        }
    }


# =========================
# Get Single Ticket
# USER only
# =========================

@router.get(
    "/{ticket_id}",
    response_model=TicketResponse
)
def get_ticket(
    ticket_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    result = (
        db.query(Ticket, Booking, Event)
        .join(
            Booking,
            Ticket.booking_id == Booking.id
        )
        .join(
            Event,
            Booking.event_id == Event.id
        )
        .filter(
            Ticket.id == ticket_id,
            Booking.user_id == current_user.id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    ticket, booking, event = result

    return build_ticket_response(
        ticket,
        booking,
        event
    )