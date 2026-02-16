import styles from "./HistoryChart.module.scss";

export type HistoryChartPoint = {
   date: string;
   value: number;
};

type HistoryChartProps = {
   points: HistoryChartPoint[];
   rangeLabel: string;
   averageValue?: number | null;
};

export function HistoryChart({
   points,
   rangeLabel,
   averageValue,
}: HistoryChartProps) {
   const maxValue = points.reduce((max, item) => Math.max(max, item.value), 0);
   const averageHeight =
      averageValue && maxValue > 0 ? (averageValue / maxValue) * 100 : null;
   const chartStyle = {
      "--chart-columns": points.length,
   } as React.CSSProperties;

   return (
      <section
         className={styles.chart}
         aria-label={rangeLabel}
         style={chartStyle}
      >
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
      </section>
   );
}
