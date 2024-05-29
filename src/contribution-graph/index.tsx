import { ViewStyle } from "react-native";

import { AbstractChartProps } from "../AbstractChart";
import ContributionGraph, {
  ContributionChartValue,
  TooltipDataAttrs,
} from "./ContributionGraph";

export interface ContributionGraphProps extends AbstractChartProps {
  values: Array<any>;
  endDate: Date;
  center?: boolean;
  numDays: number;
  width: number;
  height: number;
  gutterSize?: number;
  squareSize?: number;
  horizontal?: boolean;
  horizontalOffset?: number;
  showMonthLabels?: boolean;
  monthBreakOffset: number;
  showDayLabels?: boolean;
  showOutOfRangeDays?: boolean;
  accessor?: string;
  getMonthLabel?: (monthIndex: number) => string;
  getDayLabel?: (monthIndex: number) => string;
  onDayPress?: ({ count, date }: { count: number; date: Date }) => void;
  classForValue?: (value: string) => string;
  style?: Partial<ViewStyle>;
  titleForValue?: (value: ContributionChartValue) => string;
  tooltipDataAttrs: TooltipDataAttrs;
}

export type ContributionGraphState = {
  maxValue: number;
  minValue: number;
  valueCache: object;
};

export default ContributionGraph;
