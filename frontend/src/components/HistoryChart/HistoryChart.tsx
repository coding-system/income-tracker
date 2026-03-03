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
   const scaleMaxValue = maxValue > 0 ? maxValue * 1.12 : 0;
   const averageHeight =
      averageValue && scaleMaxValue > 0
         ? (averageValue / scaleMaxValue) * 100
         : null;
   const targetHeight =
      targetValue && scaleMaxValue > 0
         ? (targetValue / scaleMaxValue) * 100
         : null;
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
               const height =
                  scaleMaxValue > 0 ? (item.value / scaleMaxValue) * 100 : 0;
               const barHeight =
                  item.value > 0 ? `max(${height}%, 0.24em)` : "0.24em";
               const valueBottom = `calc(${barHeight} + 0.25em)`;
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
                           style={{ bottom: valueBottom }}
                        >
                           {new Intl.NumberFormat("ru-RU", {
                              maximumFractionDigits: 0,
                           }).format(item.value)}
                        </span>
                        <span
                           className={styles.chart__bar}
                           style={{ height: barHeight }}
                        />
                     </span>
                  </button>
               );
            })}
         </div>
         <div className={styles.chart__labels}>
            {points.map((item) => (
               <span key={`${item.key}-label`}>{item.label}</span>
            ))}
         </div>
      </section>
   );
}
