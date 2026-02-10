import React, { useId, useMemo, useState } from "react";
import CardGrid from "@/components/card-grid";
import { ArrowDown } from "@/icons/arrowDonw";
import styles from "./ExpandableCard.module.css";

export type ExpandableCardProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  span?: 2 | 3 | 4 | 6 | 12;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
  revealDelay?: string;
  reveal?: boolean;
};

export default function ExpandableCard({
  title,
  icon,
  children,
  defaultExpanded = true,
  expanded,
  onToggle,
  span = 12,
  className,
  headerClassName,
  bodyClassName,
  contentClassName,
  revealDelay,
  reveal = false,
}: ExpandableCardProps) {
  const isControlled = typeof expanded === "boolean";
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = isControlled ? expanded : internalExpanded;
  const contentId = useId();

  const handleToggle = () => {
    const next = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onToggle?.(next);
  };

  const cardClassName = className
    ? `${styles.card} ${className}`
    : styles.card;

  const headerClass = headerClassName
    ? `${styles.header} ${headerClassName}`
    : styles.header;

  const bodyClass = bodyClassName
    ? `${styles.body} ${isExpanded ? styles.expanded : ""} ${bodyClassName}`
    : `${styles.body} ${isExpanded ? styles.expanded : ""}`;

  const contentClass = contentClassName
    ? `${styles.content} ${contentClassName}`
    : styles.content;

  const revealStyle = useMemo(() => {
    if (!revealDelay) return undefined;
    return { ["--reveal-delay" as any]: revealDelay };
  }, [revealDelay]);

  return (
    <CardGrid
      className={cardClassName}
      span={span}
      data-reveal={reveal ? true : undefined}
      style={revealStyle}
    >
      <div className={headerClass}>
        <div className={styles.headerLeft}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <div className={styles.title}>{title}</div>
        </div>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={handleToggle}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          aria-label={isExpanded ? "Recolher card" : "Expandir card"}
        >
          <ArrowDown rotated={isExpanded} disableToggle />
        </button>
      </div>
      <div id={contentId} className={bodyClass}>
        <div className={contentClass}>{children}</div>
      </div>
    </CardGrid>
  );
}
