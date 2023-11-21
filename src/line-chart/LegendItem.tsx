import React from "react";
import { ColorValue, View } from "react-native";
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

  const { baseLegendItemX, index, legendOffset } = props;
  /* half the height of the legend Rect, minus half the height of the circle to align the
     circle from its center, rather than its top. */
  const centerAlignedCircle = legendOffset / 2 - CIRCLE_WIDTH / 2;
  // 65% of the legend container height centers the text in relation to the circles
  const centerAlignedText = legendOffset * 0.65;
  // to center the legendItem on the baseLegendItemX
  const textLengthOffset = (props.legendText.length * CHARACTER_WIDTH) / 2;
  const legendItemNumber = index + 1;

  const x1Text =
    baseLegendItemX * legendItemNumber + (PADDING_LEFT - textLengthOffset);
  const y1Text = centerAlignedText;

  const textWidth =
    props.legendText
      .split("")
      .reduce(
        (acc, char) =>
          (acc += NARROW_CHARACTERS.has(char)
            ? NARROW_CHARACTER_WIDTH
            : CHARACTER_WIDTH),
        0
      ) * 1.1;

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
        width={baseLegendItemX}
        height={CIRCLE_WIDTH * 2}
        x={
          baseLegendItemX * legendItemNumber - (CIRCLE_WIDTH + textLengthOffset)
        }
        y={centerAlignedCircle / 2}
      />
      <Rect
        width={CIRCLE_WIDTH}
        height={CIRCLE_WIDTH}
        fill={props.iconColor}
        rx={8}
        ry={8}
        x={
          baseLegendItemX * legendItemNumber - (CIRCLE_WIDTH + textLengthOffset)
        }
        y={centerAlignedCircle}
      />
      <Text x={x1Text} y={y1Text} {...props.labelProps}>
        {props.legendText}
        {!isEnabled && (
          <Line
            x1={x1Text}
            y1={legendOffset * 0.55}
            x2={x1Text + textWidth}
            y2={legendOffset * 0.55}
            stroke="grey"
            strokeWidth="2"
          />
        )}
      </Text>
    </G>
  );
};
