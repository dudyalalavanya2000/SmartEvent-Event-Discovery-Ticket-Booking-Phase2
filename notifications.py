from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_any_authenticated_user
from ..models import (
    Booking,
    BookingStatus,
    Event,
    Notification,
    NotificationType,
    User
)
from ..schemas import NotificationResponse


# =========================
# Notifications Router
# =========================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================
# Create Event Reminders
# =========================

def create_event_reminders(
    current_user: User,
    db: Session
):
    now = datetime.utcnow()
    reminder_limit = now + timedelta(hours=24)

    # Find confirmed bookings for events happening
    # within the next 24 hours
    upcoming_bookings = (
        db.query(Booking, Event)
        .join(
            Event,
            Booking.event_id == Event.id
        )
        .filter(
            Booking.user_id == current_user.id,
            Booking.booking_status == BookingStatus.CONFIRMED,
            Event.event_date >= now,
            Event.event_date <= reminder_limit
        )
        .all()
    )

    for booking, event in upcoming_bookings:

        # Prevent duplicate reminder notifications
        existing_reminder = (
            db.query(Notification)
            .filter(
                Notification.user_id == current_user.id,
                Notification.type == NotificationType.EVENT,
                Notification.message.like(
                    f"%{event.title}%"
                )
            )
            .first()
        )

        if existing_reminder:
            continue

        notification = Notification(
            user_id=current_user.id,
            title="Upcoming Event Reminder",
            message=(
                f"Reminder: '{event.title}' is happening "
                f"on {event.event_date.strftime('%d-%m-%Y at %I:%M %p')}. "
                "You have a confirmed booking for this event."
            ),
            type=NotificationType.EVENT,
            is_read=False
        )

        db.add(notification)

    db.commit()


# =========================
# Get My Notifications
# USER / ORGANIZER / ADMIN
# =========================

@router.get(
    "/",
    response_model=list[NotificationResponse]
)
def get_my_notifications(
    current_user: User = Depends(
        require_any_authenticated_user
    ),
    db: Session = Depends(get_db)
):
    # Generate reminders before returning notifications
    create_event_reminders(
        current_user,
        db
    )

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )

    return notifications


# =========================
# Get Unread Count
# USER / ORGANIZER / ADMIN
# =========================

@router.get(
    "/unread-count"
)
def get_unread_count(
    current_user: User = Depends(
        require_any_authenticated_user
    ),
    db: Session = Depends(get_db)
):
    # Generate reminders first
    create_event_reminders(
        current_user,
        db
    )

    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False)
        )
        .count()
    )

    return {
        "unread_count": count
    }


# =========================
# Mark Notification as Read
# USER / ORGANIZER / ADMIN
# =========================

@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(
        require_any_authenticated_user
    ),
    db: Session = Depends(get_db)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification
