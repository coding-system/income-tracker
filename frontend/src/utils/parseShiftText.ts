const ONES: Record<string, number> = {
   ноль: 0,
   один: 1,
   одна: 1,
   одно: 1,
   два: 2,
   две: 2,
   три: 3,
   четыре: 4,
   пять: 5,
   шесть: 6,
   семь: 7,
   восемь: 8,
   девять: 9,
};

const TEENS: Record<string, number> = {
   десять: 10,
   одиннадцать: 11,
   двенадцать: 12,
   тринадцать: 13,
   четырнадцать: 14,
   пятнадцать: 15,
   шестнадцать: 16,
   семнадцать: 17,
   восемнадцать: 18,
   девятнадцать: 19,
};

const TENS: Record<string, number> = {
   двадцать: 20,
   тридцать: 30,
   сорок: 40,
   пятьдесят: 50,
   шестьдесят: 60,
   семьдесят: 70,
   восемьдесят: 80,
   девяносто: 90,
};

const HUNDREDS: Record<string, number> = {
   сто: 100,
   двести: 200,
   триста: 300,
   четыреста: 400,
   пятьсот: 500,
   шестьсот: 600,
   семьсот: 700,
   восемьсот: 800,
   девятьсот: 900,
};

const THOUSAND_WORDS = new Set([
   "тысяча",
   "тысячи",
   "тысяч",
   "тыща",
   "тыщи",
   "тыщ",
]);

const KM_UNIT = /^(км|километр[а-я]*)$/;
const TRIP_UNIT = /^(поездк[а-я]*|поездок|заказ[а-я]*|рейс[а-я]*)$/;
const HOUR_UNIT = /^(ч|час[а-я]*)$/;
const MINUTE_UNIT = /^(мин|минут[а-я]*)$/;
const MONEY_UNIT = /^(руб[а-я]*|₽)$/;
const MONEY_VERB =
   /^(заработал[а-я]*|заработок[а-я]*|доход[а-я]*|получил[а-я]*|выручк[а-я]*)$/;

const FUEL_KEYWORD =
   /^(заправ[а-я]*|бензин[а-я]*|топлив[а-я]*|газ[а-я]*|дт|солярк[а-я]*)$/;
const WASH_KEYWORD =
   /^(мойк[а-я]*|мыл[а-я]*|помыл[а-я]*|вымыл[а-я]*|автомойк[а-я]*)$/;
const SNACK_KEYWORD =
   /^(поел[а-я]*|обед[а-я]*|перекус[а-я]*|позавтракал[а-я]*|поужинал[а-я]*|кафе|еда|едой|столов[а-я]*)$/;
const OTHER_KEYWORD =
   /^(потрат[а-я]*|расход[а-я]*|прочее|другое|штраф[а-я]*|парковк[а-я]*|стоянк[а-я]*)$/;

const ORDINAL_ONES: Record<string, number> = {
   первое: 1,
   второе: 2,
   третье: 3,
   четвертое: 4,
   пятое: 5,
   шестое: 6,
   седьмое: 7,
   восьмое: 8,
   девятое: 9,
};

const ORDINAL_TEENS: Record<string, number> = {
   десятое: 10,
   одиннадцатое: 11,
   двенадцатое: 12,
   тринадцатое: 13,
   четырнадцатое: 14,
   пятнадцатое: 15,
   шестнадцатое: 16,
   семнадцатое: 17,
   восемнадцатое: 18,
   девятнадцатое: 19,
};

const ORDINAL_TENS_EXACT: Record<string, number> = {
   двадцатое: 20,
   тридцатое: 30,
};

const MONTH_MAP: Record<string, number> = {
   январь: 1,
   января: 1,
   февраль: 2,
   февраля: 2,
   март: 3,
   марта: 3,
   апрель: 4,
   апреля: 4,
   май: 5,
   мая: 5,
   июнь: 6,
   июня: 6,
   июль: 7,
   июля: 7,
   август: 8,
   августа: 8,
   сентябрь: 9,
   сентября: 9,
   октябрь: 10,
   октября: 10,
   ноябрь: 11,
   ноября: 11,
   декабрь: 12,
   декабря: 12,
};

type DayMatch = {
   day: number;
   endIndex: number;
};

const parseDayOrdinal = (tokens: string[], index: number): DayMatch | null => {
   const token = tokens[index];

   if (token in ORDINAL_TEENS) {
      return { day: ORDINAL_TEENS[token], endIndex: index + 1 };
   }
   if (token in ORDINAL_TENS_EXACT) {
      return { day: ORDINAL_TENS_EXACT[token], endIndex: index + 1 };
   }
   if (token in ORDINAL_ONES) {
      return { day: ORDINAL_ONES[token], endIndex: index + 1 };
   }
   if ((token === "двадцать" || token === "тридцать") && tokens[index + 1]) {
      const nextToken = tokens[index + 1];
      if (nextToken in ORDINAL_ONES) {
         return {
            day: TENS[token] + ORDINAL_ONES[nextToken],
            endIndex: index + 2,
         };
      }
   }
   if (/^\d{1,2}$/.test(token)) {
      const value = Number(token);
      if (value >= 1 && value <= 31) {
         return { day: value, endIndex: index + 1 };
      }
   }

   return null;
};

const toIsoDate = (value: Date) => {
   const year = value.getFullYear();
   const month = String(value.getMonth() + 1).padStart(2, "0");
   const day = String(value.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
};

const extractDate = (
   tokens: string[],
): { date: string; consumedEnd: number; consumedStart: number } | null => {
   for (let index = 0; index < tokens.length; index += 1) {
      const dayMatch = parseDayOrdinal(tokens, index);
      if (!dayMatch) {
         continue;
      }

      const monthToken = tokens[dayMatch.endIndex];
      if (!monthToken || !(monthToken in MONTH_MAP)) {
         continue;
      }

      const month = MONTH_MAP[monthToken];
      let consumedEnd = dayMatch.endIndex + 1;
      let year = new Date().getFullYear();

      const yearToken = tokens[consumedEnd];
      if (yearToken && /^\d{4}$/.test(yearToken)) {
         year = Number(yearToken);
         consumedEnd += 1;
      }

      const candidate = new Date(year, month - 1, dayMatch.day);
      if (candidate.getMonth() !== month - 1) {
         continue;
      }

      return {
         date: toIsoDate(candidate),
         consumedStart: index,
         consumedEnd,
      };
   }

   return null;
};

const CLOSE_VERB =
   /^(закрыть|закрой|закрываю|закрыл[а-я]*|завершить|завершил[а-я]*|закончить|закончил[а-я]*)$/;
const SHIFT_NOUN = /^(смену|смена|смены)$/;

type CloseMatch = {
   consumedStart: number;
   consumedEnd: number;
};

const extractCloseIntent = (tokens: string[]): CloseMatch | null => {
   for (let index = 0; index < tokens.length; index += 1) {
      if (!CLOSE_VERB.test(tokens[index])) {
         continue;
      }

      let consumedEnd = index + 1;
      if (tokens[consumedEnd] && SHIFT_NOUN.test(tokens[consumedEnd])) {
         consumedEnd += 1;
      }

      return { consumedStart: index, consumedEnd };
   }

   return null;
};

const EXPENSE_CONTEXT_WINDOW = 4;

type ExpenseCategory = "fuel" | "wash" | "snack" | "other";

const findExpenseCategoryBefore = (
   tokens: string[],
   numberStart: number,
): ExpenseCategory | undefined => {
   const limit = Math.max(0, numberStart - EXPENSE_CONTEXT_WINDOW);

   for (let j = numberStart - 1; j >= limit; j -= 1) {
      const token = tokens[j];

      if (token === "@@break@@") {
         return undefined;
      }
      if (MONEY_VERB.test(token)) {
         return undefined;
      }
      if (FUEL_KEYWORD.test(token)) {
         return "fuel";
      }
      if (WASH_KEYWORD.test(token)) {
         return "wash";
      }
      if (SNACK_KEYWORD.test(token)) {
         return "snack";
      }
      if (OTHER_KEYWORD.test(token)) {
         return "other";
      }
   }

   return undefined;
};

type NumberMatch = {
   value: number;
   endIndex: number;
};

const parseNumberSequence = (
   tokens: string[],
   start: number,
): NumberMatch | null => {
   let index = start;
   let total = 0;
   let group = 0;
   let consumed = false;

   while (index < tokens.length) {
      const token = tokens[index];

      if (token in HUNDREDS) {
         group += HUNDREDS[token];
         consumed = true;
         index += 1;
         continue;
      }
      if (token in TENS) {
         group += TENS[token];
         consumed = true;
         index += 1;
         continue;
      }
      if (token in TEENS) {
         group += TEENS[token];
         consumed = true;
         index += 1;
         continue;
      }
      if (token in ONES) {
         group += ONES[token];
         consumed = true;
         index += 1;
         continue;
      }
      if (group === 0 && /^\d+([.,]\d+)?$/.test(token)) {
         group += Number(token.replace(",", "."));
         consumed = true;
         index += 1;
         continue;
      }
      if (THOUSAND_WORDS.has(token)) {
         total += (group === 0 ? 1 : group) * 1000;
         group = 0;
         consumed = true;
         index += 1;
         continue;
      }

      break;
   }

   if (!consumed) {
      return null;
   }

   return { value: total + group, endIndex: index };
};

export type ParsedShiftFields = {
   date?: string;
   closeShift?: boolean;
   incomeTotal?: number;
   mileageKm?: number;
   tripsCount?: number;
   engineHours?: number;
   fuelings?: number[];
   washes?: number[];
   snacks?: number[];
   others?: number[];
};

export function parseShiftText(rawText: string): ParsedShiftFields {
   const normalized = rawText
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/(\d{1,2}):(\d{2})/g, "$1 час $2 минут")
      .replace(/(\d)[.,](?=\d)/g, "$1@@decimal@@")
      .replace(/(\d)([а-я])/gi, "$1 $2")
      .replace(/(\d{1,3})((?:\s\d{3})+)(?!\d)/g, (_match, first, rest) =>
         first + String(rest).replace(/\s/g, ""),
      )
      .replace(/[,.;:]+/g, " @@break@@ ")
      .replace(/@@decimal@@/g, ".")
      .replace(/\s+/g, " ")
      .trim();

   if (!normalized) {
      return {};
   }

   const tokens = normalized.split(" ");
   const result: ParsedShiftFields = {};

   const dateMatch = extractDate(tokens);
   if (dateMatch) {
      result.date = dateMatch.date;
      tokens.splice(
         dateMatch.consumedStart,
         dateMatch.consumedEnd - dateMatch.consumedStart,
         "@@break@@",
      );
   }

   const closeMatch = extractCloseIntent(tokens);
   if (closeMatch) {
      result.closeShift = true;
      tokens.splice(
         closeMatch.consumedStart,
         closeMatch.consumedEnd - closeMatch.consumedStart,
         "@@break@@",
      );
   }

   let hoursPart: number | undefined;
   let minutesPart: number | undefined;
   const fuelings: number[] = [];
   const washes: number[] = [];
   const snacks: number[] = [];
   const others: number[] = [];

   let i = 0;
   while (i < tokens.length) {
      const parsed = parseNumberSequence(tokens, i);
      if (!parsed) {
         i += 1;
         continue;
      }

      const { value, endIndex } = parsed;
      const nextToken = tokens[endIndex];
      const prevToken = i > 0 ? tokens[i - 1] : undefined;

      if (nextToken && KM_UNIT.test(nextToken) && result.mileageKm === undefined) {
         result.mileageKm = Math.round(value);
         i = endIndex + 1;
         continue;
      }

      if (
         nextToken &&
         TRIP_UNIT.test(nextToken) &&
         result.tripsCount === undefined
      ) {
         result.tripsCount = Math.round(value);
         i = endIndex + 1;
         continue;
      }

      if (nextToken && HOUR_UNIT.test(nextToken) && hoursPart === undefined) {
         hoursPart = value;
         i = endIndex + 1;
         continue;
      }

      if (
         nextToken &&
         MINUTE_UNIT.test(nextToken) &&
         minutesPart === undefined
      ) {
         minutesPart = value;
         i = endIndex + 1;
         continue;
      }

      const expenseCategory = findExpenseCategoryBefore(tokens, i);
      if (expenseCategory) {
         const amount = Math.round(value);
         if (expenseCategory === "fuel") {
            fuelings.push(amount);
         } else if (expenseCategory === "wash") {
            washes.push(amount);
         } else if (expenseCategory === "snack") {
            snacks.push(amount);
         } else {
            others.push(amount);
         }
         i = endIndex + (nextToken && MONEY_UNIT.test(nextToken) ? 1 : 0);
         continue;
      }

      if (
         result.incomeTotal === undefined &&
         ((nextToken && MONEY_UNIT.test(nextToken)) ||
            (prevToken && MONEY_VERB.test(prevToken)))
      ) {
         result.incomeTotal = Math.round(value);
         i = nextToken && MONEY_UNIT.test(nextToken) ? endIndex + 1 : endIndex;
         continue;
      }

      i = endIndex;
   }

   if (hoursPart !== undefined || minutesPart !== undefined) {
      result.engineHours = Number(
         ((hoursPart ?? 0) + (minutesPart ?? 0) / 60).toFixed(2),
      );
   }

   if (fuelings.length > 0) {
      result.fuelings = fuelings;
   }
   if (washes.length > 0) {
      result.washes = washes;
   }
   if (snacks.length > 0) {
      result.snacks = snacks;
   }
   if (others.length > 0) {
      result.others = others;
   }

   return result;
}
