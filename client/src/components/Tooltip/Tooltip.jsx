import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

/**
 * Tooltip that works on both desktop (hover) and tablet (tap).
 * Rendered via a portal to document.body so it is never clipped by
 * parent overflow constraints.
 *
 * Props:
 *   text      — tooltip string (or null/undefined → renders children unchanged)
 *   position  — 'above' (default) | 'below'
 *   children  — the element to wrap
 */
export default function Tooltip({ text, position = 'above', children }) {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState({});
  const wrapperRef = useRef(null);
  const hideTimer = useRef(null);
  const isTouchRef = useRef(false);

  function getFixedStyle() {
    if (!wrapperRef.current) return {};
    const rect = wrapperRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    if (position === 'above') {
      return { top: rect.top - 6, left: cx, transform: 'translate(-50%, -100%)' };
    }
    return { top: rect.bottom + 6, left: cx, transform: 'translateX(-50%)' };
  }

  function show() {
    clearTimeout(hideTimer.current);
    setStyle(getFixedStyle());
    setVisible(true);
  }

  function hide() {
    hideTimer.current = setTimeout(() => setVisible(false), 120);
  }

  function handleTouchStart() {
    isTouchRef.current = true;
  }

  function handleClick(e) {
    if (!isTouchRef.current) return;
    e.preventDefault();
    setVisible(v => {
      if (!v) {
        setStyle(getFixedStyle());
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setVisible(false), 4000);
      }
      return !v;
    });
  }

  if (!text) return children;

  return (
    <span
      ref={wrapperRef}
      className="tt-wrapper"
      onMouseEnter={() => { if (!isTouchRef.current) show(); }}
      onMouseLeave={() => { if (!isTouchRef.current) hide(); }}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {children}
      {visible && createPortal(
        <span className={`tt-box tt-box--${position}`} role="tooltip" style={style}>
          {text}
        </span>,
        document.body
      )}
    </span>
  );
}
