import _ from "lodash";
import React, { ReactNode, useEffect, useRef } from "react";
import { ScrollView, View } from "react-native";
import { G, Rect, RectProps, Svg, Text } from "react-native-svg";

import { ContributionGraphProps, ContributionGraphState } from ".";
import AbstractChart from "../AbstractChart";
import { mapValue } from "../Utils";
import {
  convertToDate,
  getBeginningTimeForDate,
  shiftDate,
} from "./DateHelpers";
import {
  DAYS_IN_WEEK,
  DAY_LABELS,
  MILLISECONDS_IN_ONE_DAY,
  MONTH_LABELS,
} from "./constants";
import Animated, {
  FadeIn,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SQUARE_SIZE = 20;
const MONTH_LABEL_GUTTER_SIZE = 8;
const paddingLeft = 32;
const LABEL_PADDING_LEFT = 10;

export type ContributionChartValue = {
  value: number;
  title: string;
  tooltipDataAttrs: TooltipDataAttrs;
  date: Date;
};

export type TooltipDataAttrs = (
  value: ContributionChartValue
) => Partial<RectProps> | Partial<RectProps>;

class ContributionGraph extends AbstractChart<
  ContributionGraphProps,
  ContributionGraphState
> {
  constructor(props: ContributionGraphProps) {
    super(props);

    let { maxValue, minValue, valueCache } = this.getValueCache(props.values);

    this.state = {
      maxValue,
      minValue,
      valueCache,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: ContributionGraphProps) {
    let { maxValue, minValue, valueCache } = this.getValueCache(
      nextProps.values
    );

    this.setState({
      maxValue,
      minValue,
      valueCache,
    });
  }

  getSquareSizeWithGutter() {
    return (this.props.squareSize || SQUARE_SIZE) + this.props.gutterSize;
  }

  getMonthLabelSize() {
    let { squareSize = SQUARE_SIZE } = this.props;
    if (!this.props.showMonthLabels) {
      return 0;
    }
    if (this.props.horizontal) {
      return squareSize + MONTH_LABEL_GUTTER_SIZE;
    }
    return 2 * (squareSize + MONTH_LABEL_GUTTER_SIZE);
  }

  getStartDate() {
    return shiftDate(this.getEndDate(), -this.props.numDays);
  }

  getEndDate() {
    return getBeginningTimeForDate(convertToDate(this.props.endDate));
  }

  getStartDateWithEmptyDays() {
    return shiftDate(this.getStartDate(), -this.getNumEmptyDaysAtStart());
  }

  getNumEmptyDaysAtStart() {
    return this.getStartDate().getDay();
  }

  getNumEmptyDaysAtEnd() {
    return DAYS_IN_WEEK - 1 - this.getEndDate().getDay();
  }

  getWeekCount() {
    const numDaysRoundedToWeek =
      this.props.numDays +
      this.getNumEmptyDaysAtStart() +
      this.getNumEmptyDaysAtEnd();
    return Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK);
  }

  getWeekWidth() {
    return DAYS_IN_WEEK * this.getSquareSizeWithGutter();
  }

  getChartWidth() {
    return (
      this.getWeekCount() * this.getSquareSizeWithGutter() +
      paddingLeft * 2 +
      (this.getWeekCount() / 4) * this.getMonthBreakOffset()
    );
  }

  getWidth() {
    return Math.max(this.getChartWidth(), this.props.width);
  }

  getMonthBreakOffset() {
    return this.props.monthBreakOffset || 4;
  }

  getHeight() {
    return (
      this.getWeekWidth() + (this.getMonthLabelSize() - this.props.gutterSize)
    );
  }

  getValueCache(values: ContributionChartValue[]) {
    let minValue = Infinity,
      maxValue = -Infinity;

    return {
      valueCache: values.reduce((memo, value) => {
        const date = convertToDate(value.date);

        const index = Math.floor(
          (date.valueOf() - this.getStartDateWithEmptyDays().valueOf()) /
            MILLISECONDS_IN_ONE_DAY
        );

        minValue = Math.min(value[this.props.accessor], minValue);
        maxValue = Math.max(value[this.props.accessor], maxValue);

        memo[index] = {
          value,
          title: this.props.titleForValue
            ? this.props.titleForValue(value)
            : null,
          tooltipDataAttrs: this.getTooltipDataAttrsForValue(value),
        };

        return memo;
      }, {}),
      minValue,
      maxValue,
    };
  }

  getValueForIndex(index: number) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].value;
    }
    return null;
  }

  getClassNameForIndex(index: number) {
    if (this.state.valueCache[index]) {
      if (this.state.valueCache[index].value) {
        const count = this.state.valueCache[index].value[this.props.accessor];

        if (count) {
          const opacity = mapValue(
            count,
            this.state.maxValue === this.state.minValue
              ? 0
              : this.state.minValue,
            isNaN(this.state.maxValue) ? 1 : this.state.maxValue,
            0.15 + 0.05, // + 0.05 to make smaller values a bit more visible
            1
          );

          return this.props.chartConfig.color(opacity);
        }
      }
    }

    return this.props.chartConfig.color(0.15);
  }

  getTitleForIndex(index: number) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].title;
    }

    return this.props.titleForValue ? this.props.titleForValue(null) : null;
  }

  getTooltipDataAttrsForIndex(index: number) {
    if (this.state.valueCache[index]) {
      return this.state.valueCache[index].tooltipDataAttrs;
    }

    return this.getTooltipDataAttrsForValue({
      date: null,
      [this.props.accessor]: null,
    } as ContributionChartValue);
  }

  getTooltipDataAttrsForValue(value: ContributionChartValue) {
    const { tooltipDataAttrs } = this.props;

    if (typeof tooltipDataAttrs === "function") {
      return tooltipDataAttrs(value);
    }

    return tooltipDataAttrs;
  }

  getTransformForWeek(weekIndex: number) {
    if (this.props.horizontal) {
      const horizontalOffset = this.props.horizontalOffset || 0;
      return [
        horizontalOffset + weekIndex * this.getSquareSizeWithGutter(),
        50,
      ];
    }
    return [10, weekIndex * this.getSquareSizeWithGutter()];
  }

  getTransformForMonthLabels() {
    if (this.props.horizontal) {
      return null;
    }
    return `${this.getWeekWidth() + MONTH_LABEL_GUTTER_SIZE}, 0`;
  }

  getTransformForAllWeeks() {
    if (this.props.horizontal) {
      return `0, ${this.getMonthLabelSize() - 100}`;
    }
    return null;
  }

  getViewBox() {
    if (this.props.horizontal) {
      return `${this.getWidth()} ${this.getHeight()}`;
    }
    return `${this.getHeight()} ${this.getWidth()}`;
  }

  getSquareCoordinates(dayIndex: number) {
    if (this.props.horizontal) {
      return [
        0,
        dayIndex * this.getSquareSizeWithGutter() -
          (this.props.verticalOffset || 0),
      ];
    }
    return [dayIndex * this.getSquareSizeWithGutter(), 0];
  }

  getMonthLabelCoordinates(weekIndex: number) {
    if (this.props.horizontal) {
      return [
        weekIndex * (this.getSquareSizeWithGutter() + 1) +
          paddingLeft -
          this.props.horizontalOffset,
        this.getMonthLabelSize() - MONTH_LABEL_GUTTER_SIZE,
      ];
    }
    const verticalOffset = -2;
    return [
      0,
      (weekIndex + 1) * this.getSquareSizeWithGutter() + verticalOffset,
    ];
  }

  getDayLabelCoordinates(dayIndex: number) {
    if (this.props.horizontal) {
      return [
        LABEL_PADDING_LEFT,
        60 +
          dayIndex * (this.props.squareSize || SQUARE_SIZE) -
          (this.props.verticalOffset || 0),
      ];
    }
    const verticalOffset = -2;
    return [
      0,
      (dayIndex + 1) * this.getSquareSizeWithGutter() + verticalOffset,
    ];
  }

  renderSquare(dayIndex: number, index: number, offsetX: number = 0) {
    const indexOutOfRange =
      index < this.getNumEmptyDaysAtStart() ||
      index >= this.getNumEmptyDaysAtStart() + this.props.numDays;

    if (indexOutOfRange && !this.props.showOutOfRangeDays) {
      return null;
    }

    const [x, y] = this.getSquareCoordinates(dayIndex);
    const { squareSize = SQUARE_SIZE } = this.props;

    return (
      <AnimatedSquare
        key={index}
        animationDuration={this.props.animationDuration || 0}
        width={squareSize}
        height={squareSize}
        x={x + paddingLeft + offsetX}
        y={y}
        title={this.getTitleForIndex(index)}
        fill={this.getClassNameForIndex(index)}
        onPress={() => {
          this.handleDayPress(index);
        }}
        {...this.getTooltipDataAttrsForIndex(index)}
      />
    );
  }

  handleDayPress(index: number) {
    if (!this.props.onDayPress) {
      return;
    }

    index = index - this.getNumEmptyDaysAtStart() + 1;

    this.props.onDayPress(
      this.state.valueCache[index] && this.state.valueCache[index].value
        ? this.state.valueCache[index].value
        : {
            [this.props.accessor]: 0,
            date: new Date(
              this.getStartDate().valueOf() + index * MILLISECONDS_IN_ONE_DAY
            ),
          }
    );
  }

  renderWeek(weekIndex: number, offset: number, weekStart: Date) {
    const [x, y] = this.getTransformForWeek(weekIndex);
    const monthBreakOffset = this.getMonthBreakOffset();
    return (
      <G key={weekIndex} x={x + offset} y={y}>
        {_.range(DAYS_IN_WEEK).map((dayIndex) => {
          const curDay = addDays(weekStart, dayIndex);

          const dayOffset =
            curDay.getMonth() !== weekStart.getMonth() ? monthBreakOffset : 0;

          return this.renderSquare(
            dayIndex,
            weekIndex * DAYS_IN_WEEK + dayIndex,
            dayOffset
          );
        })}
      </G>
    );
  }

  renderAllWeeks(offset: number = 0) {
    const monthBreakOffset = this.getMonthBreakOffset();
    let _offset = offset;
    return _.range(this.getWeekCount()).map((weekIndex) => {
      const d = addWeeks(this.getStartDate(), weekIndex);
      const startOfWeek = getStartOfWeek(d);

      _offset =
        addDays(startOfWeek, -1).getMonth() !== startOfWeek.getMonth()
          ? _offset + monthBreakOffset
          : _offset;

      const renderedWeeks = this.renderWeek(weekIndex, _offset, startOfWeek);
      _offset =
        startOfWeek.getMonth() !== getEndOfWeek(d).getMonth()
          ? _offset + monthBreakOffset
          : _offset;
      return renderedWeeks;
    });
  }

  renderMonthLabels(offset: number = 0) {
    if (!this.props.showMonthLabels) {
      return null;
    }

    const weekRange = _.range(this.getWeekCount());

    let curMonth: number;
    return weekRange.map((weekIndex) => {
      const d = addWeeks(this.getStartDate(), weekIndex);

      if (curMonth === d.getMonth()) return null;
      curMonth = d.getMonth();

      let week0Offset = 0;
      if (weekIndex === 0) {
        week0Offset = Math.max(5 - getWeekOfMonth(d), 1);
      }

      const [x, y] = this.getMonthLabelCoordinates(
        weekIndex + (weekIndex > 0 ? 3 : week0Offset)
      );

      return (
        <Text
          key={weekIndex}
          x={x + offset}
          y={y}
          {...this.getPropsForLabels()}
        >
          {this.props.getMonthLabel
            ? this.props.getMonthLabel(curMonth)
            : MONTH_LABELS[curMonth]}
        </Text>
      );
    });
  }

  renderDayLabels(offset: number = 0) {
    if (!this.props.showDayLabels) {
      return null;
    }

    const dayRange = _.range(7);

    return dayRange.map((dayIndex) => {
      const [x, y] = this.getDayLabelCoordinates(dayIndex);

      return (
        <Text
          key={dayIndex}
          x={x + offset}
          y={y + 4 + dayIndex * this.props.gutterSize}
          {...this.getPropsForLabels()}
        >
          {this.props.getDayLabel
            ? this.props.getDayLabel(dayIndex)
            : DAY_LABELS[dayIndex]}
        </Text>
      );
    });
  }

  public static defaultProps = {
    numDays: 200,
    endDate: new Date(),
    gutterSize: 1,
    squareSize: SQUARE_SIZE,
    horizontal: true,
    showMonthLabels: true,
    showOutOfRangeDays: false,
    accessor: "count",
    classForValue: (value) => (value ? "black" : "#8cc665"),
    style: {},
  };

  render() {
    const { style } = this.props;

    let { borderRadius = 0 } = style;

    if (!borderRadius && this.props.chartConfig.style) {
      const stupidXo = this.props.chartConfig.style.borderRadius;
      borderRadius = stupidXo;
    }

    const width = this.getWidth();

    const offset =
      this.props.center && this.getChartWidth() < this.getWidth()
        ? (this.getWidth() - this.getChartWidth()) / 2
        : 0;

    const svg = (renderDaylabels: boolean = true) => (
      <Svg height={this.props.height} width={width}>
        {this.renderDefs({
          width: this.props.width,
          height: this.props.height,
          ...this.props.chartConfig,
        })}
        <Rect
          width="100%"
          height={this.props.height}
          rx={borderRadius as number}
          ry={borderRadius as number}
          fill="url(#backgroundGradient)"
        />
        {renderDaylabels && <G>{this.renderDayLabels(offset)}</G>}
        <G>{this.renderMonthLabels(offset)}</G>
        <G>{this.renderAllWeeks(offset)}</G>
      </Svg>
    );

    return (
      <View
        style={[
          {
            justifyContent: "center",
            alignItems: "center",
            width: this.props.width,
            borderRadius: borderRadius,
            overflow: "hidden",
            flexDirection: "row",
          },
          style,
        ]}
      >
        <View style={{ marginRight: -40, zIndex: 100 }}>
          <Svg height={this.props.height} width={40}>
            {this.renderDefs({
              width: this.props.width,
              height: this.props.height,
              ...this.props.chartConfig,
            })}
            <Rect
              width="100%"
              height={this.props.height}
              rx={borderRadius as number}
              ry={borderRadius as number}
              fill="url(#backgroundGradient)"
            />
            <G>{this.renderDayLabels(offset)}</G>
          </Svg>
        </View>
        {this.getWidth() > this.props.width ? (
          <_ScrollView>{svg(false)}</_ScrollView>
        ) : (
          svg()
        )}
      </View>
    );
  }
}

function _ScrollView({ children }: { children: ReactNode }) {
  const ref = useRef<ScrollView>(null);

  return (
    <ScrollView
      onLayout={() => ref.current?.scrollToEnd({ animated: true })}
      ref={ref}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {children}
    </ScrollView>
  );
}

export default ContributionGraph;

function getStartOfWeek(d: Date) {
  return addDays(d, d.getDay() * -1 + 1);
}

function getEndOfWeek(d: Date) {
  return addDays(d, 7 - d.getDay());
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addWeeks(date: Date, weeks: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

function getWeekOfMonth(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay() || 7;
  const offsetDate = date.getDate() + firstDayOfWeek - 1;
  return Math.ceil(offsetDate / 7);
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type AnimatedSquareProps = {
  animationDuration: number;
} & RectProps;

function AnimatedSquare(props: AnimatedSquareProps) {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    animationValue.value = withTiming(1, {
      duration: Math.round(Math.random() * props.animationDuration),
    });
  }, []);

  return <AnimatedRect opacity={animationValue} {...props} />;
}
