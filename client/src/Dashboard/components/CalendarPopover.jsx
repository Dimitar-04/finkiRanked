import React, { useRef, useEffect } from 'react';
import 'cally';

const CalendarPopover = ({
  isOpen,
  onClose,
  onDateSelect,
  selectedDate,
  isFromManageChallenges,
}) => {
  const popoverRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && calendarRef.current && selectedDate) {
      const date = new Date(selectedDate);
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() - timezoneOffset);
      calendarRef.current.value = adjustedDate.toISOString().split('T')[0];
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    const calendarEl = calendarRef.current;

    const handleDateChange = (event) => {
      if (event.target.value) {
        const selected = new Date(event.target.value + 'T00:00:00');
        onDateSelect(selected);
        onClose();
      }
    };

    if (isOpen && calendarEl) {
      calendarEl.addEventListener('change', handleDateChange);
    }

    return () => {
      if (calendarEl) {
        calendarEl.removeEventListener('change', handleDateChange);
      }
    };
  }, [isOpen, onDateSelect, onClose]);
  if (!isOpen) {
    return null;
  }

  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(today.getTime() - timezoneOffset);
  const maxDate = adjustedDate.toISOString().split('T')[0];

  return (
    <div
      ref={popoverRef}
      className="absolute top-10 mt-2  z-30 bg-base-200 rounded-lg shadow-xl p-4 border border-base-300 w-[320px]"
    >
      <calendar-date
        ref={calendarRef}
        class="cally bg-base-100 border border-base-300 shadow-md rounded-box w-full mb-4"
        max={isFromManageChallenges ? '' : maxDate}
      >
        <svg
          aria-label="Previous"
          className="fill-current size-4"
          slot="previous"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
        </svg>
        <svg
          aria-label="Next"
          className="fill-current size-4"
          slot="next"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
        </svg>
        <calendar-month></calendar-month>
      </calendar-date>
    </div>
  );
};

export default CalendarPopover;
