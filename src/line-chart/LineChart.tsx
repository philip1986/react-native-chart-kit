import React, { ReactNode, useEffect, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import {
  Circle,
  CircleProps,
  G,
  Path,
  Polygon,
  Polyline,
  Rect,
  Svg,
} from "react-native-svg";

import AbstractChart, {
  AbstractChartConfig,
  AbstractChartProps,
} from "../AbstractChart";
import { ChartData, Dataset } from "../HelperTypes";
import { LegendItem } from "./LegendItem";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

let AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface LineChartData extends ChartData {
  legend?: string[];
}

export interface LineChartProps extends AbstractChartProps {
  /**
   * Data for the chart.
   *
   * Example from [docs](https://github.com/indiespirit/react-native-chart-kit#line-chart):
   *
   * ```javascript
   * const data = {
   *   labels: ['January', 'February', 'March', 'April', 'May', 'June'],
   *   datasets: [{
   *     data: [ 20, 45, 28, 80, 99, 43 ],
   *     color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
   *     strokeWidth: 2 // optional
   *   }],
   *   legend: ["Rainy Days", "Sunny Days", "Snowy Days"] // optional
   * }
   * ```
   */
  data: LineChartData;
  /**
   * Width of the chart, use 'Dimensions' library to get the width of your screen for responsive.
   */
  width: number;
  /**
   * Height of the chart.
   */
  height: number;
  /**
   * Show dots on the line - default: True.
   */
  withDots?: boolean;
  /**
   * Show shadow for line - default: True.
   */
  withShadow?: boolean;
  /**
   * Show inner dashed lines - default: True.
   */

  withScrollableDot?: boolean;
  withInnerLines?: boolean;
  /**
   * Show outer dashed lines - default: True.
   */
  withOuterLines?: boolean;
  /**
   * Show vertical lines - default: True.
   */
  withVerticalLines?: boolean;
  /**
   * Show horizontal lines - default: True.
   */
  withHorizontalLines?: boolean;
  /**
   * Show vertical labels - default: True.
   */
  withVerticalLabels?: boolean;
  /**
   * Show horizontal labels - default: True.
   */
  withHorizontalLabels?: boolean;
  /**
   * Render charts from 0 not from the minimum value. - default: False.
   */
  fromZero?: boolean;
  /**
   * Prepend text to horizontal labels -- default: ''.
   */
  yAxisLabel?: string;
  /**
   * Append text to horizontal labels -- default: ''.
   */
  yAxisSuffix?: string;
  /**
   * Prepend text to vertical labels -- default: ''.
   */
  xAxisLabel?: string;
  /**
   * Configuration object for the chart, see example:
   *
   * ```javascript
   * const chartConfig = {
   *   backgroundGradientFrom: "#1E2923",
   *   backgroundGradientFromOpacity: 0,
   *   backgroundGradientTo: "#08130D",
   *   backgroundGradientToOpacity: 0.5,
   *   color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
   *   labelColor: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
   *   strokeWidth: 2, // optional, default 3
   *   barPercentage: 0.5
   * };
   * ```
   */
  chartConfig?: AbstractChartConfig;

  /**
   * Divide axis quantity by the input number -- default: 1.
   */
  yAxisInterval?: number;

  /**
   * Defines if chart is transparent
   */
  transparent?: boolean;
  /**
   * This function takes a [whole bunch](https://github.com/indiespirit/react-native-chart-kit/blob/master/src/line-chart.js#L266)
   * of stuff and can render extra elements,
   * such as data point info or additional markup.
   */
  decorator?: Function;
  /**
   * Callback that is called when a data point is clicked.
   */
  onDataPointClick?: (data: {
    index: number;
    value: number;
    dataset: Dataset;
    x: number;
    y: number;
    getColor: (opacity: number) => string;
  }) => void;
  /**
   * Style of the container view of the chart.
   */
  style?: Partial<ViewStyle>;
  /**
   * Add this prop to make the line chart smooth and curvy.
   *
   * [Example](https://github.com/indiespirit/react-native-chart-kit#bezier-line-chart)
   */
  bezier?: boolean;
  /**
   * Defines the dot color function that is used to calculate colors of dots in a line chart.
   * Takes `(dataPoint, dataPointIndex)` as arguments.
   */
  getDotColor?: (dataPoint: any, index: number) => string;
  /**
   * Renders additional content for dots in a line chart.
   * Takes `({x, y, index})` as arguments.
   */
  renderDotContent?: (params: {
    x: number;
    y: number;
    index: number;
    indexData: number;
  }) => React.ReactNode;
  /**
   * Rotation angle of the horizontal labels - default 0 (degrees).
   */
  horizontalLabelRotation?: number;
  /**
   * Rotation angle of the vertical labels - default 0 (degrees).
   */
  verticalLabelRotation?: number;
  /**
   * Offset for Y axis labels.
   */
  yLabelsOffset?: number;
  /**
   * Offset for X axis labels.
   */
  xLabelsOffset?: number;
  /**
   * Array of indices of the data points you don't want to display.
   */
  hidePointsAtIndex?: number[];
  /**
   * This function change the format of the display value of the Y label.
   * Takes the y value as argument and should return the desirable string.
   */
  formatYLabel?: (yValue: string) => string;
  /**
   * This function change the format of the display value of the X label.
   * Takes the X value as argument and should return the desirable string.
   */
  formatXLabel?: (xValue: string) => string;
  /**
   * Provide props for a data point dot.
   */
  getDotProps?: (dataPoint: any, index: number) => object;
  /**
   * The number of horizontal lines
   */
  segments?: number;

  animationDuration?: number;

  marginXAxes?: number;
}

type LineChartState = {
  scrollableDotHorizontalOffset: Animated.Value;
};

class LineChart extends AbstractChart<LineChartProps, LineChartState> {
  label = React.createRef<TextInput>();

  state = {
    scrollableDotHorizontalOffset: new Animated.Value(0),
    enabeldDatasets: new Set(this.props.data.datasets.map((_, i) => i)),
    _datasets: this.props.data.datasets,
  };

  getColor = (dataset: Dataset, opacity: number) => {
    return (dataset.color || this.props.chartConfig.color)(opacity);
  };

  getStrokeWidth = (dataset: Dataset) => {
    return dataset.strokeWidth || this.props.chartConfig.strokeWidth || 3;
  };

  getDatas = (data: Dataset[]): number[] => {
    return data.reduce(
      (acc, item) => (item.data ? [...acc, ...item.data] : acc),
      []
    );
  };

  getPropsForDots = (x: any, i: number) => {
    const { getDotProps, chartConfig } = this.props;

    if (typeof getDotProps === "function") {
      return getDotProps(x, i);
    }

    const { propsForDots = {} } = chartConfig;

    return { r: "4", ...propsForDots };
  };

  renderDots = ({
    data,
    width,
    height,
    paddingTop,
    paddingRight,
    onDataPointClick,
    minDatapoint,
    maxDatapoint,
    xMax,
  }: Pick<
    AbstractChartConfig,
    "data" | "width" | "height" | "paddingRight" | "paddingTop"
  > & {
    onDataPointClick: LineChartProps["onDataPointClick"];
    minDatapoint: number;
    maxDatapoint: number;
    xMax: number;
  }) => {
    const output: ReactNode[] = [];
    const baseHeight = this.calcBaseHeightAlt(
      minDatapoint,
      maxDatapoint,
      height
    );

    const {
      getDotColor,
      hidePointsAtIndex = [],
      renderDotContent = null,
    } = this.props;

    data.forEach((dataset) => {
      if (dataset.withDots == false) return;
      const _getDorColor =
        typeof getDotColor === "function"
          ? getDotColor
          : () => this.getColor(dataset, 0.9);

      dataset.data.forEach((x, i) => {
        if (hidePointsAtIndex.includes(i)) {
          return;
        }

        const cx = paddingRight + (i * (width - paddingRight)) / xMax;

        const cy =
          ((baseHeight -
            this.calcHeightAlt(x, height, minDatapoint, maxDatapoint)) /
            4) *
            3 +
          paddingTop;

        const onPress = () => {
          if (!onDataPointClick || hidePointsAtIndex.includes(i)) {
            return;
          }

          onDataPointClick({
            index: i,
            value: x,
            dataset,
            x: cx,
            y: cy,
            getColor: (opacity) => this.getColor(dataset, opacity),
          });
        };

        const props: Partial<CircleProps> = this.getPropsForDots(x, i);

        output.push(
          <Circle
            key={Math.random()}
            cx={cx}
            cy={cy}
            fill={_getDorColor(x, i)}
            onPress={onPress}
            {...props}
          />,
          renderDotContent &&
            renderDotContent({ x: cx, y: cy, index: i, indexData: x })
        );

        if (+props.r < 14) {
          output.push(
            <Circle
              key={Math.random()}
              cx={cx}
              cy={cy}
              r="14"
              fillOpacity={0}
              onPress={onPress}
            />
          );
        }
      });
    });

    return output;
  };

  renderScrollableDot = ({
    data,
    width,
    height,
    paddingTop,
    paddingRight,
    scrollableDotHorizontalOffset,
    scrollableDotFill,
    scrollableDotStrokeColor,
    scrollableDotStrokeWidth,
    scrollableDotRadius,
    scrollableInfoViewStyle,
    scrollableInfoTextStyle,
    scrollableInfoTextDecorator = (x) => `${x}`,
    scrollableInfoSize,
    scrollableInfoOffset,
  }: AbstractChartConfig & {
    onDataPointClick: LineChartProps["onDataPointClick"];
    scrollableDotHorizontalOffset: Animated.Value;
  }) => {
    const output = [];
    const datas = this.getDatas(data);
    const baseHeight = this.calcBaseHeight(datas, height);

    let vl: number[] = [];

    const perData = width / data[0].data.length;
    for (let index = 0; index < data[0].data.length; index++) {
      vl.push(index * perData);
    }
    let lastIndex: number;

    scrollableDotHorizontalOffset.addListener((value) => {
      const index = value.value / perData;
      if (!lastIndex) {
        lastIndex = index;
      }

      let abs = Math.floor(index);
      let percent = index - abs;
      abs = data[0].data.length - abs - 1;

      if (index >= data[0].data.length - 1) {
        this.label.current.setNativeProps({
          text: scrollableInfoTextDecorator(Math.floor(data[0].data[0])),
        });
      } else {
        if (index > lastIndex) {
          // to right

          const base = data[0].data[abs];
          const prev = data[0].data[abs - 1];
          if (prev > base) {
            let rest = prev - base;
            this.label.current.setNativeProps({
              text: scrollableInfoTextDecorator(
                Math.floor(base + percent * rest)
              ),
            });
          } else {
            let rest = base - prev;
            this.label.current.setNativeProps({
              text: scrollableInfoTextDecorator(
                Math.floor(base - percent * rest)
              ),
            });
          }
        } else {
          // to left

          const base = data[0].data[abs - 1];
          const next = data[0].data[abs];
          percent = 1 - percent;
          if (next > base) {
            let rest = next - base;
            this.label.current.setNativeProps({
              text: scrollableInfoTextDecorator(
                Math.floor(base + percent * rest)
              ),
            });
          } else {
            let rest = base - next;
            this.label.current.setNativeProps({
              text: scrollableInfoTextDecorator(
                Math.floor(base - percent * rest)
              ),
            });
          }
        }
      }
      lastIndex = index;
    });

    data.forEach((dataset) => {
      if (dataset.withScrollableDot == false) return;

      const perData = width / dataset.data.length;
      let values = [];
      let yValues = [];
      let xValues = [];

      let yValuesLabel = [];
      let xValuesLabel = [];

      for (let index = 0; index < dataset.data.length; index++) {
        values.push(index * perData);
        const yval =
          ((baseHeight -
            this.calcHeight(
              dataset.data[dataset.data.length - index - 1],
              datas,
              height
            )) /
            4) *
            3 +
          paddingTop;
        yValues.push(yval);
        const xval =
          paddingRight +
          ((dataset.data.length - index - 1) * (width - paddingRight)) /
            dataset.data.length;
        xValues.push(xval);

        yValuesLabel.push(
          yval - (scrollableInfoSize.height + scrollableInfoOffset)
        );
        xValuesLabel.push(xval - scrollableInfoSize.width / 2);
      }

      const translateX = scrollableDotHorizontalOffset.interpolate({
        inputRange: values,
        outputRange: xValues,
        extrapolate: "clamp",
      });

      const translateY = scrollableDotHorizontalOffset.interpolate({
        inputRange: values,
        outputRange: yValues,
        extrapolate: "clamp",
      });

      const labelTranslateX = scrollableDotHorizontalOffset.interpolate({
        inputRange: values,
        outputRange: xValuesLabel,
        extrapolate: "clamp",
      });

      const labelTranslateY = scrollableDotHorizontalOffset.interpolate({
        inputRange: values,
        outputRange: yValuesLabel,
        extrapolate: "clamp",
      });

      output.push([
        <Animated.View
          key={Math.random()}
          style={[
            scrollableInfoViewStyle,
            {
              transform: [
                { translateX: labelTranslateX },
                { translateY: labelTranslateY },
              ],
              width: scrollableInfoSize.width,
              height: scrollableInfoSize.height,
            },
          ]}
        >
          <TextInput
            onLayout={() => {
              this.label.current.setNativeProps({
                text: scrollableInfoTextDecorator(
                  Math.floor(data[0].data[data[0].data.length - 1])
                ),
              });
            }}
            style={scrollableInfoTextStyle}
            ref={this.label}
          />
        </Animated.View>,
        <AnimatedCircle
          key={Math.random()}
          cx={translateX}
          cy={translateY}
          r={scrollableDotRadius}
          stroke={scrollableDotStrokeColor}
          strokeWidth={scrollableDotStrokeWidth}
          fill={scrollableDotFill}
        />,
      ]);
    });

    return output;
  };

  renderShadow = ({
    width,
    height,
    paddingRight,
    paddingTop,
    data,
    useColorFromDataset,
    minDatapoint,
    maxDatapoint,
    xMax,
  }: Pick<
    AbstractChartConfig,
    "data" | "width" | "height" | "paddingRight" | "paddingTop"
  > & {
    useColorFromDataset: AbstractChartConfig["useShadowColorFromDataset"];
    minDatapoint: number;
    maxDatapoint: number;
    xMax: number;
  }) => {
    if (this.props.bezier) {
      return this.renderBezierShadow({
        width,
        height,
        paddingRight,
        paddingTop,
        data,
        useColorFromDataset,
        minDatapoint,
        maxDatapoint,
        xMax,
      });
    }
    const baseHeight = this.calcBaseHeightAlt(
      minDatapoint,
      maxDatapoint,
      height
    );

    return data.map((dataset, index) => {
      return (
        <Polygon
          key={index}
          points={
            dataset.data
              .map((d, i) => {
                const x =
                  paddingRight +
                  (i * (width - paddingRight)) / dataset.data.length;

                const y =
                  ((baseHeight -
                    this.calcHeightAlt(d, height, minDatapoint, maxDatapoint)) /
                    4) *
                    3 +
                  paddingTop;

                return `${x},${y}`;
              })
              .join(" ") +
            ` ${
              paddingRight +
              ((width - paddingRight) / dataset.data.length) *
                (dataset.data.length - 1)
            },${(height / 4) * 3 + paddingTop} ${paddingRight},${
              (height / 4) * 3 + paddingTop
            }`
          }
          fill={`url(#fillShadowGradientFrom${
            useColorFromDataset ? `_${index}` : ""
          })`}
          strokeWidth={0}
        />
      );
    });
  };

  renderLine = ({
    width,
    height,
    paddingRight,
    paddingTop,
    data,
    linejoinType,
    minDatapoint,
    maxDatapoint,
    xMax,
  }: Pick<
    AbstractChartConfig,
    "data" | "width" | "height" | "paddingRight" | "paddingTop" | "linejoinType"
  > & {
    minDatapoint: number;
    maxDatapoint: number;
    xMax: number;
  }) => {
    if (this.props.bezier) {
      return this.renderBezierLine({
        data,
        width,
        height,
        paddingRight,
        paddingTop,
        minDatapoint,
        maxDatapoint,
        xMax,
      });
    }

    const output = [];
    const baseHeight = this.calcBaseHeightAlt(
      minDatapoint,
      maxDatapoint,
      height
    );

    let lastPoint: string;

    data.forEach((dataset, index) => {
      const points = dataset.data.map((d, i) => {
        if (d === null) return lastPoint;
        const x = (i * (width - paddingRight)) / xMax + paddingRight;
        const y =
          ((baseHeight -
            this.calcHeightAlt(d, height, minDatapoint, maxDatapoint)) /
            4) *
            3 +
          paddingTop;
        lastPoint = `${x},${y}`;
        return `${x},${y}`;
      });

      output.push(
        <Polyline
          key={index}
          strokeLinejoin={linejoinType}
          points={points.join(" ")}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
          strokeDasharray={dataset.strokeDashArray}
          strokeDashoffset={dataset.strokeDashOffset}
        />
      );
    });

    return output;
  };

  getXMaxValues = (data: Dataset[]) => {
    return data.reduce((acc, cur) => {
      return cur.data.length > acc ? cur.data.length : acc;
    }, 0);
  };

  getBezierLinePoints = (
    dataset: Dataset,
    {
      width,
      height,
      paddingRight,
      paddingTop,
      minDatapoint,
      maxDatapoint,
      xMax,
    }: Pick<
      AbstractChartConfig,
      "width" | "height" | "paddingRight" | "paddingTop" | "data"
    > & {
      minDatapoint: number;
      maxDatapoint: number;
      xMax: number;
    }
  ) => {
    if (dataset.data.length === 0) {
      return "M0,0";
    }

    const x = (i: number) =>
      Math.floor(paddingRight + (i * (width - paddingRight)) / xMax);

    const baseHeight = this.calcBaseHeightAlt(
      minDatapoint,
      maxDatapoint,
      height
    );

    const y = (i: number) => {
      const yHeight = this.calcHeightAlt(
        dataset.data[i],
        height,
        minDatapoint,
        maxDatapoint
      );

      return Math.floor(((baseHeight - yHeight) / 4) * 3 + paddingTop);
    };

    return [`M${x(0)},${y(0)}`]
      .concat(
        dataset.data.slice(0, -1).map((_, i) => {
          const xi = x(i);
          const xi1 = x(i + 1);
          const yi = y(i);
          const yi1 = y(i + 1);

          const x_mid = (xi + xi1) / 2;
          const y_mid = (yi + yi1) / 2;
          const cp_x1 = (x_mid + xi) / 2;
          const cp_x2 = (x_mid + xi1) / 2;
          return (
            `Q ${cp_x1}, ${yi}, ${x_mid}, ${y_mid}` +
            ` Q ${cp_x2}, ${yi1}, ${xi1}, ${yi1}`
          );
        })
      )
      .join(" ");
  };

  renderBezierLine = ({
    data,
    width,
    height,
    paddingRight,
    paddingTop,
    minDatapoint,
    maxDatapoint,
    xMax,
  }: Pick<
    AbstractChartConfig,
    "data" | "width" | "height" | "paddingRight" | "paddingTop"
  > & {
    minDatapoint: number;
    maxDatapoint: number;
    xMax: number;
  }) => {
    return data.map((dataset, index) => {
      const result = this.getBezierLinePoints(dataset, {
        width,
        height,
        paddingRight,
        paddingTop,
        data,
        minDatapoint,
        maxDatapoint,
        xMax,
      });

      return (
        <Path
          key={index}
          d={result}
          fill="none"
          stroke={this.getColor(dataset, 0.2)}
          strokeWidth={this.getStrokeWidth(dataset)}
          strokeDasharray={dataset.strokeDashArray}
          strokeDashoffset={dataset.strokeDashOffset}
        />
      );
    });
  };

  renderBezierShadow = ({
    width,
    height,
    paddingRight,
    paddingTop,
    data,
    useColorFromDataset,
    minDatapoint,
    maxDatapoint,
    xMax,
  }: Pick<
    AbstractChartConfig,
    "data" | "width" | "height" | "paddingRight" | "paddingTop"
  > & {
    useColorFromDataset: AbstractChartConfig["useShadowColorFromDataset"];
    minDatapoint: number;
    maxDatapoint: number;
    xMax: number;
  }) =>
    data.map((dataset, index) => {
      const d =
        this.getBezierLinePoints(dataset, {
          width,
          height,
          paddingRight,
          paddingTop,
          data,
          minDatapoint,
          maxDatapoint,
          xMax,
        }) +
        ` L${
          paddingRight +
          ((width - paddingRight) / xMax) * (dataset.data.length - 1)
        },${(height / 4) * 3 + paddingTop} L${paddingRight},${
          (height / 4) * 3 + paddingTop
        } Z`;

      return (
        <Path
          key={index}
          d={d}
          fill={`url(#fillShadowGradientFrom${
            useColorFromDataset ? `_${index}` : ""
          })`}
          strokeWidth={0}
        />
      );
    });

  renderLegend = (legendOffset) => {
    const { legend, datasets } = this.props.data;
    const baseLegendItemX = this.props.chartConfig.xLegendOffset || 80;

    return legend.map((legendItem, i) => (
      <G key={Math.random()}>
        <LegendItem
          enabled={this.state.enabeldDatasets.has(i)}
          allowDisabledLegendItems={
            this.state.enabeldDatasets.size > 1 || legend.length === 2
          }
          index={i}
          onToggel={(isEnabled) => {
            isEnabled
              ? this.state.enabeldDatasets.add(i)
              : this.state.enabeldDatasets.delete(i);

            if (this.state.enabeldDatasets.size === 0) {
              this.state.enabeldDatasets.add(
                legend.findIndex((_, ii) => ii !== i)
              );
            }

            this.state._datasets = this.props.data.datasets.filter((_, i) =>
              this.state.enabeldDatasets.has(i)
            );
            this.forceUpdate();
          }}
          iconColor={this.getColor(datasets[i], 0.9)}
          baseLegendItemX={baseLegendItemX}
          legendText={legendItem}
          labelProps={{
            ...this.getPropsForLabels(),
            fontSize:
              this.props.chartConfig.legendFontSize ||
              this.getPropsForLabels().fontSize,
          }}
          legendOffset={legendOffset}
        />
      </G>
    ));
  };

  render() {
    const {
      width,
      height,
      data,
      withScrollableDot = false,
      withShadow = true,
      withDots = true,
      withInnerLines = true,
      withOuterLines = true,
      withHorizontalLines = true,
      withVerticalLines = true,
      withHorizontalLabels = true,
      withVerticalLabels = true,
      style = {},
      decorator,
      onDataPointClick,
      verticalLabelRotation = 0,
      horizontalLabelRotation = 0,
      formatYLabel = (yLabel) => yLabel,
      formatXLabel = (xLabel) => xLabel,
      segments,
      transparent = false,
      chartConfig,
    } = this.props;

    const { scrollableDotHorizontalOffset } = this.state;
    const { labels = [] } = data;
    const {
      borderRadius = 0,
      paddingTop = 16,
      paddingRight = 64,
      margin = 0,
      marginRight = 0,
      paddingBottom = 0,
    } = style;

    const config = {
      width,
      height: height - (this.props.marginXAxes || 0),
      verticalLabelRotation,
      horizontalLabelRotation,
    };

    const datas = this.getDatas(this.state._datasets);
    const minDatapoint = Math.min(...datas);
    const maxDatapoint = Math.max(...datas);
    const xMax = this.getXMaxValues(this.state._datasets);

    let count = minDatapoint === maxDatapoint ? 1 : 4;
    if (segments) {
      count = segments;
    }

    const legendOffset = this.props.data.legend
      ? height * 0.15 +
        (this.props.data.legend.length *
          this.props.chartConfig.legendFontSize) /
          2
      : 0;

    return (
      <View style={style}>
        <Svg
          height={height + (paddingBottom as number) + legendOffset}
          width={width - (margin as number) * 2 - (marginRight as number)}
        >
          <Rect
            width="100%"
            height={height + legendOffset}
            rx={borderRadius as number}
            ry={borderRadius as number}
            fill="url(#backgroundGradient)"
            fillOpacity={transparent ? 0 : 1}
          />
          {this.props.data.legend && this.renderLegend(legendOffset)}
          <G x="0" y={legendOffset}>
            {this.renderDefs({
              ...config,
              ...chartConfig,
              data: this.state._datasets,
            })}

            {withHorizontalLines &&
              (withInnerLines
                ? this.renderHorizontalLines({
                    ...config,
                    count: count,
                    paddingTop,
                    paddingRight,
                  })
                : withOuterLines
                ? this.renderHorizontalLine({
                    ...config,
                    paddingTop,
                    paddingRight,
                  })
                : null)}

            {withHorizontalLabels &&
              this.renderHorizontalLabels({
                ...config,
                count: count,
                data: datas,
                paddingTop: paddingTop as number,
                paddingRight: paddingRight as number,
                formatYLabel,
                decimalPlaces: chartConfig.decimalPlaces,
              })}

            {withVerticalLines &&
              (withInnerLines
                ? this.renderVerticalLines({
                    ...config,
                    data: this.state._datasets[0].data,
                    paddingTop: paddingTop as number,
                    paddingRight: paddingRight as number,
                  })
                : withOuterLines
                ? this.renderVerticalLine({
                    ...config,
                    paddingTop: paddingTop as number,
                    paddingRight: paddingRight as number,
                  })
                : null)}

            {withVerticalLabels &&
              this.renderVerticalLabels({
                ...config,
                labels,
                paddingTop: paddingTop as number,
                paddingRight: paddingRight as number,
                formatXLabel,
              })}

            <_Line
              renderFn={this.renderLine}
              props={{
                ...config,
                ...chartConfig,
                paddingRight: paddingRight as number,
                paddingTop: paddingTop as number,
                data: this.state._datasets,
                minDatapoint,
                maxDatapoint,
                xMax,
              }}
              animationDuration={this.props.animationDuration}
            />

            {withShadow && (
              <_LineShadow
                renderFn={this.renderShadow}
                props={{
                  ...config,
                  data: this.state._datasets,
                  paddingRight: paddingRight as number,
                  paddingTop: paddingTop as number,
                  useColorFromDataset: chartConfig.useShadowColorFromDataset,
                  minDatapoint,
                  maxDatapoint,
                  xMax,
                }}
                animationDuration={this.props.animationDuration}
              />
            )}

            {withDots && (
              <_Dots
                renderFn={this.renderDots}
                props={{
                  ...config,
                  data: this.state._datasets,
                  paddingTop: paddingTop as number,
                  paddingRight: paddingRight as number,
                  onDataPointClick,
                  minDatapoint,
                  maxDatapoint,
                  xMax,
                }}
                animationDuration={this.props.animationDuration}
              />
            )}

            {withScrollableDot &&
              this.renderScrollableDot({
                ...config,
                ...chartConfig,
                data: this.state._datasets,
                paddingTop: paddingTop as number,
                paddingRight: paddingRight as number,
                onDataPointClick,
                scrollableDotHorizontalOffset,
              })}

            {decorator &&
              decorator({
                ...config,
                data: this.state._datasets,
                paddingTop,
                paddingRight,
              })}
          </G>
        </Svg>
        {withScrollableDot && (
          <ScrollView
            style={StyleSheet.absoluteFill}
            contentContainerStyle={{ width: width * 2 }}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: { x: scrollableDotHorizontalOffset },
                  },
                },
              ],
              { useNativeDriver: false }
            )}
            horizontal
            bounces={false}
          />
        )}
      </View>
    );
  }
}

export default LineChart;

type RenderFnBaseProps = Pick<AbstractChartConfig, "data"> & {
  minDatapoint: number;
  maxDatapoint: number;
  xMax: number;
};

type RenderFnProps = {
  renderFn: (props: RenderFnBaseProps) => ReactNode;
  props: RenderFnBaseProps;
  animationDuration?: number;
};

function _Render<P extends RenderFnProps>({
  renderFn,
  props,
  animationDuration,
}: P) {
  const [_data, setData] = useState(props.data);

  useEffect(() => {
    if (!animationDuration) {
      setData(props.data);
      return;
    }
    const animationValue = new Animated.Value(0);

    Animated.timing(animationValue, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: false,
      easing: Easing.ease,
    }).start();

    const subscription = animationValue.addListener((v) => {
      setData(
        props.data.map((dataset) => ({
          ...dataset,
          data: dataset.data.map((d) => d * v.value),
        }))
      );
    });

    return () => {
      animationValue.removeListener(subscription);
    };
  }, [props.data]);

  return renderFn({ ...props, data: _data });
}

type LineFnProps = Pick<
  AbstractChartConfig,
  "data" | "width" | "height" | "paddingRight" | "paddingTop" | "linejoinType"
> &
  RenderFnBaseProps;

interface _LineProps {
  renderFn: (props: LineFnProps) => ReactNode;
  props: LineFnProps;
  animationDuration?: number;
}

function _Line({ renderFn, props, animationDuration }: _LineProps) {
  return (
    <_Render
      renderFn={renderFn}
      props={props}
      animationDuration={animationDuration}
    />
  );
}

type LineShadowFnProps = Pick<
  AbstractChartConfig,
  "data" | "width" | "height" | "paddingRight" | "paddingTop"
> &
  RenderFnBaseProps & {
    useColorFromDataset: AbstractChartConfig["useShadowColorFromDataset"];
  };

interface _LineShadowProps {
  renderFn: (props: LineShadowFnProps) => ReactNode;
  props: LineShadowFnProps;
  animationDuration?: number;
}

function _LineShadow({ renderFn, props, animationDuration }: _LineShadowProps) {
  return (
    <_Render
      renderFn={renderFn}
      props={props}
      animationDuration={animationDuration}
    />
  );
}

type DotsFnProps = Pick<
  AbstractChartConfig,
  "data" | "width" | "height" | "paddingRight" | "paddingTop"
> &
  RenderFnBaseProps & {
    onDataPointClick: LineChartProps["onDataPointClick"];
  };

interface _DotsProps {
  renderFn: (props: DotsFnProps) => ReactNode;
  props: DotsFnProps;
  animationDuration?: number;
}

function _Dots({ renderFn, props, animationDuration }: _DotsProps) {
  return (
    <_Render
      renderFn={renderFn}
      props={props}
      animationDuration={animationDuration}
    />
  );
}
