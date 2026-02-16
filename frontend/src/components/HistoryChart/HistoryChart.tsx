import styles from "./HistoryChart.module.scss";

export type HistoryChartPoint = {
   date: string;
   value: number;
};

type HistoryChartProps = {
   points: HistoryChartPoint[];
   rangeLabel: string;
   averageValue?: number | null;
   targetValue?: number | null;
};

export function HistoryChart({
   points,
   rangeLabel,
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
   const labels = points.map((item, index) => {
      const dayValue = Number(item.date.slice(8, 10));
      const fallback = Number.isNaN(dayValue) ? "" : String(dayValue);
      if (points.length === 30) {
         return index % 2 === 0 ? fallback : "•";
      }
      return fallback;
   });
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
                  <span
                     key={item.date}
                     className={styles.chart__bar}
                     style={{ height: `${height}%` }}
                     title={item.date}
                  />
               );
            })}
         </div>
         <div className={styles.chart__labels}>
            {labels.map((label, index) => (
               <span key={`${points[index]?.date ?? index}-label`}>
                  {label}
               </span>
            ))}
         </div>
      </section>
   );
}
