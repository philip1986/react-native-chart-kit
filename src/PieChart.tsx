import Pie from "paths-js/pie";
import React, { useEffect, useState } from "react";
import { Animated, Easing, View, ViewStyle } from "react-native";
import { G, Path, Rect, Svg } from "react-native-svg";

import AbstractChart, { AbstractChartProps } from "./AbstractChart";

export interface PieChartProps extends AbstractChartProps {
  data: Array<any>;
  width: number;
  height: number;
  accessor: string;
  backgroundColor: string;
  paddingLeft: string;
  center?: Array<number>;
  absolute?: boolean;
  hasLegend?: boolean;
  style?: Partial<ViewStyle>;
  avoidFalseZero?: boolean;
  animationDuration?: number;
  legendHorizontalOffset?: number;
}

type PieChartState = {};

class PieChart extends AbstractChart<PieChartProps, PieChartState> {
  render() {
    const {
      style = {},
      backgroundColor,
      absolute = false,
      hasLegend = true,
      avoidFalseZero = false,
    } = this.props;

    const { borderRadius = 0 } = style;

    return (
      <View
        style={{
          width: this.props.width,
          height: this.props.height,
          padding: 0,
          ...style,
        }}
      >
        <Svg width={this.props.width} height={this.props.height}>
          <G>
            {this.renderDefs({
              width: this.props.height,
              height: this.props.height,
              ...this.props.chartConfig,
            })}
          </G>
          <Rect
            width="100%"
            height={this.props.height}
            rx={borderRadius as number}
            ry={borderRadius as number}
            fill={backgroundColor}
          />
          <G
            x={
              this.props.width / 2 / 2 +
              Number(this.props.paddingLeft ? this.props.paddingLeft : 0)
            }
            y={this.props.height / 2}
          >
            <Slices
              data={this.props.data}
              accessor={this.props.accessor}
              width={this.props.width}
              height={this.props.height}
              center={this.props.center}
              absolute={absolute}
              hasLegend={hasLegend}
              avoidFalseZero={avoidFalseZero}
              animationDuration={this.props.animationDuration}
              legendHorizontalOffset={this.props.legendHorizontalOffset || 0}
            />
          </G>
        </Svg>
      </View>
    );
  }
}

export default PieChart;

interface SlicesProps {
  data: Array<any>;
  accessor: string;
  width: number;
  height: number;
  center: Array<number>;
  absolute: boolean;
  hasLegend: boolean;
  avoidFalseZero: boolean;
  animationDuration?: number;
  legendHorizontalOffset?: number;
}

function Slices({
  data,
  accessor,
  width,
  height,
  center,
  absolute,
  hasLegend,
  avoidFalseZero,
  animationDuration,
  legendHorizontalOffset,
}: SlicesProps) {
  const total = data.reduce((sum, item) => {
    return sum + item[accessor];
  }, 0);

  const chart = Pie({
    center: center || [0, 0],
    r: 0,
    R: height / 2.5,
    data: data,
    accessor: (x) => {
      return x[accessor];
    },
  });

  return chart.curves.map((c, i) => {
    let value: string;

    if (absolute) {
      value = c.item[accessor];
    } else {
      if (total === 0) {
        value = 0 + "%";
      } else {
        const percentage = Math.round((100 / total) * c.item[accessor]);
        value = Math.round((100 / total) * c.item[accessor]) + "%";
        if (avoidFalseZero && percentage === 0) {
          value = "<1%";
        } else {
          value = percentage + "%";
        }
      }
    }

    return (
      <G key={Math.random()}>
        <Slice
          index={i}
          data={data}
          center={center}
          height={height}
          accessor={accessor}
          total={total}
          animationDuration={animationDuration}
        />
        {hasLegend && (
          <LegendItem
            index={i}
            text={c.item.name}
            color={c.item.color}
            widgetHeight={height}
            legendItemCount={legendItemCount}
            animationDuration={animationDuration}
          />
        )}
      </G>
    );
  });
}

interface LegendProps {
  text: JSX.Element;
  color: string;
  index: number;
  widgetHeight: number;
  legendItemCount: number;
  animationDuration?: number;
}

function LegendItem({
  text,
  color,
  index,
  widgetHeight,
  legendItemCount,
  animationDuration,
}: LegendProps) {
  const [opacity, setOpacity] = useState(animationDuration ? 0 : 1);
  const ROW_HEIGHT = 30;

  useEffect(() => {
    if (!animationDuration) return;
    const animationValue = new Animated.Value(0);

    Animated.timing(animationValue, {
      toValue: 1,
      duration: animationDuration * 3,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.ease),
    }).start();

    const subscription = animationValue.addListener(({ value }) => {
      setOpacity(value);
    });

    return () => {
      animationValue.removeListener(subscription);
    };
  }, []);

  const totalHeight = legendItemCount * ROW_HEIGHT;

  return (
    <View
      style={{
        position: "absolute",
        top: (widgetHeight - totalHeight) * 0.5 + index * ROW_HEIGHT,
        left: "60%",
        flex: 1,
        flexDirection: "row",
      }}
    >
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: color,
          opacity,
        }}
      />
      {text}
    </View>
  );
}

interface SliceProps {
  index: number;
  data: Array<any>;
  center: Array<number>;
  height: number;
  accessor: string;
  total: number;
  animationDuration?: number;
}

function Slice({
  index,
  data,
  center,
  height,
  accessor,
  total,
  animationDuration,
}: SliceProps) {
  const [chart, setChart] = useState(
    Pie({
      center: center || [0, 0],
      r: 0,
      R: height / 2.5,
      data,
      accessor: (x) => x[accessor],
    })
  );

  useEffect(() => {
    if (!animationDuration) return;
    const animationValue = new Animated.Value(1);

    Animated.timing(animationValue, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();

    const subscription = animationValue.addListener(({ value }) => {
      setChart(
        Pie({
          center: center || [0, 0],
          r: 0,
          R: height / 2.5,
          data: [...data, { [accessor]: total * 10 * value }],
          accessor: (x) => x[accessor],
        })
      );
    });

    return () => {
      animationValue.removeListener(subscription);
    };
  }, [data]);

  if (!chart) return null;

  return (
    <Path
      d={chart.curves[index].sector.path.print()}
      fill={data[index].color}
    />
  );
}
