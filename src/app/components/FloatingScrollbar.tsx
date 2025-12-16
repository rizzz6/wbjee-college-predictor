'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface FloatingScrollbarProps {
  tableRef: RefObject<HTMLDivElement | null>;
  className?: string;
}

export default function FloatingScrollbar({ tableRef, className = '' }: FloatingScrollbarProps) {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Check if table needs horizontal scrolling and if user is at bottom
  useEffect(() => {
    const checkVisibility = () => {
      if (!tableRef.current) return;

      const table = tableRef.current;
      const rect = table.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if table overflows horizontally
      const needsScrolling = table.scrollWidth > table.clientWidth;

      // Check if user can see the bottom scrollbar (table bottom is visible)
      const tableBottomVisible = rect.bottom <= windowHeight;

      // Check if entire table fits in viewport
      const tableFits = rect.height <= windowHeight;

      setIsVisible(needsScrolling && !tableBottomVisible && !tableFits);
      setScrollWidth(table.scrollWidth);
      setIsAtBottom(tableBottomVisible);
    };

    // Initial check
    checkVisibility();

    // Check on scroll and resize
    const handleScroll = () => checkVisibility();
    const handleResize = () => checkVisibility();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Also check when table content changes
    const observer = new MutationObserver(checkVisibility);
    if (tableRef.current) {
      observer.observe(tableRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [tableRef]);

  // Sync scrollbar position with table
  useEffect(() => {
    if (!tableRef.current || !scrollbarRef.current) return;

    const table = tableRef.current;
    const scrollbar = scrollbarRef.current;

    const syncScrollbar = () => {
      if (!isAtBottom) {
        scrollbar.scrollLeft = table.scrollLeft;
      }
    };

    const syncTable = () => {
      if (!isAtBottom) {
        table.scrollLeft = scrollbar.scrollLeft;
      }
    };

    // Sync from table to scrollbar
    table.addEventListener('scroll', syncScrollbar);

    // Sync from scrollbar to table
    scrollbar.addEventListener('scroll', syncTable);

    return () => {
      table.removeEventListener('scroll', syncScrollbar);
      scrollbar.removeEventListener('scroll', syncTable);
    };
  }, [tableRef, isAtBottom]);

  if (!isVisible) return null;

  return (
    <div
      ref={scrollbarRef}
      className={`fixed bottom-0 left-0 right-0 z-40 h-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg ${className}`}
      style={{
        width: '100vw',
        overflowX: 'auto',
        overflowY: 'hidden'
      }}
    >
      {/* Invisible content to match table width */}
      <div
        style={{
          width: scrollWidth,
          height: '1px',
          visibility: 'hidden'
        }}
      />
    </div>
  );
}