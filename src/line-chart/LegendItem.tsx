import React from "react";
import { ColorValue } from "react-native";
import { G, Line, Rect, Text, TextProps } from "react-native-svg";

const CIRCLE_WIDTH = 16;
const PADDING_LEFT = 4;
const CHARACTER_WIDTH = 6;
const NARROW_CHARACTER_WIDTH = 4;
const NARROW_CHARACTERS = new Set([
  "1",
  "j",
  "i",
  "I",
  "l",
  "!",
  ":",
  ".",
  ",",
  " ",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
]);

export type LegendItemProps = {
  baseLegendItemX: number;
  index: number;
  legendOffset: number;
  legendText: string;
  iconColor: ColorValue;
  labelProps: TextProps;
  enabled: boolean;
  allowDisabledLegendItems: boolean;
  onToggel: (isEnabled: boolean) => void;
};

export const LegendItem = (props: LegendItemProps) => {
  const [isEnabled, setIsEnabled] = React.useState(props.enabled);
  const fontSize = Number(props.labelProps.fontSize);

  const { baseLegendItemX, index } = props;

  const legendItemNumber = index + 0;

  const x1Text = baseLegendItemX + PADDING_LEFT;
  const y1Text = 20 + (fontSize + 5) * legendItemNumber;

  return (
    <G
      opacity={isEnabled ? 1 : 0.3}
      onPress={() => {
        if (!props.allowDisabledLegendItems && isEnabled) {
          return;
        }
        setIsEnabled((p) => {
          const newState = !p;
          props.onToggel(newState);
          return newState;
        });
      }}
    >
      <Rect
        width={props.legendText.length * CHARACTER_WIDTH * 2}
        height={CIRCLE_WIDTH * 1.5}
        opacity={0}
        x={baseLegendItemX - CIRCLE_WIDTH}
        y={y1Text - fontSize + 2}
      />
      <Rect
        width={CIRCLE_WIDTH}
        height={CIRCLE_WIDTH}
        fill={props.iconColor}
        rx={8}
        ry={8}
        x={baseLegendItemX - CIRCLE_WIDTH}
        y={y1Text - fontSize + 2}
      />
      <Text x={x1Text} y={y1Text} {...props.labelProps}>
        {props.legendText}
      </Text>
    </G>
  );
};
