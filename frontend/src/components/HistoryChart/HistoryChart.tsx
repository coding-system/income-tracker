import styles from "./HistoryChart.module.scss";

export type HistoryChartPoint = {
   key: string;
   label: string;
   value: number;
};

type HistoryChartProps = {
   points: HistoryChartPoint[];
   rangeLabel: string;
   selectedKey: string | null;
   onSelect: (key: string) => void;
   averageValue?: number | null;
   targetValue?: number | null;
};

export function HistoryChart({
   points,
   rangeLabel,
   selectedKey,
   onSelect,
   averageValue,
   targetValue,
}: HistoryChartProps) {
   const maxValueBase = points.reduce(
      (max, item) => Math.max(max, item.value),
      0,
   );
   const maxValue = Math.max(maxValueBase, averageValue ?? 0, targetValue ?? 0);
   const averageHeight =
      averageValue && maxValue > 0 ? (averageValue / maxValue) * 100 : null;
   const targetHeight =
      targetValue && maxValue > 0 ? (targetValue / maxValue) * 100 : null;
   const chartStyle = {
      "--chart-columns": points.length,
   } as React.CSSProperties;

   return (
      <section
         className={styles.chart}
         aria-label={rangeLabel}
         style={chartStyle}
      >
         <div className={styles.chart__bars}>
            {targetHeight !== null ? (
               <span
                  className={styles.chart__targetLine}
                  style={{ bottom: `${targetHeight}%` }}
                  aria-hidden="true"
               />
            ) : null}
            {averageHeight !== null ? (
               <span
                  className={styles.chart__avgLine}
                  style={{ bottom: `${averageHeight}%` }}
                  aria-hidden="true"
               />
            ) : null}
            {points.map((item) => {
               const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
               return (
                  <button
                     key={item.key}
                     className={`${styles.chart__column} ${
                        selectedKey === item.key
                           ? styles["chart__column--active"]
                           : ""
                     }`}
                     type="button"
                     onClick={() => onSelect(item.key)}
                     title={item.label}
                  >
                     <span className={styles.chart__barWrap}>
                        <span
                           className={styles.chart__value}
                           style={{ bottom: `calc(${height}% + 0.25em)` }}
                        >
                           {new Intl.NumberFormat("ru-RU", {
                              maximumFractionDigits: 0,
                           }).format(item.value)}
                        </span>
                        <span
                           className={styles.chart__bar}
                           style={{ height: `${height}%` }}
                        />
                     </span>
                  </button>
               );
            })}
         </div>
         <div className={styles.chart__labels}>
            {points.map((item) => (
               <span key={`${item.key}-label`}>
                  {item.label}
               </span>
            ))}
         </div>
      </section>
   );
}
