import React from "react";
import { ColorValue, TouchableOpacity, View } from "react-native";
import { TextProps } from "react-native-svg";

export const CIRCLE_WIDTH = 16;
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
  legendText: JSX.Element;
  iconColor: ColorValue;
  enabled: boolean;
  allowDisabledLegendItems: boolean;
  onToggel: (isEnabled: boolean) => void;
};

export const LegendItem = (props: LegendItemProps) => {
  const [isEnabled, setIsEnabled] = React.useState(props.enabled);

  return (
    <TouchableOpacity
      style={{
        opacity: isEnabled ? 1 : 0.3,
        flexDirection: "row",

        minHeight: CIRCLE_WIDTH + 4,
      }}
      activeOpacity={props.allowDisabledLegendItems ? 0.7 : 1}
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
      <View
        style={{
          width: CIRCLE_WIDTH,
          height: CIRCLE_WIDTH,
          backgroundColor: props.iconColor,
          borderRadius: CIRCLE_WIDTH,

          marginRight: CIRCLE_WIDTH,
        }}
      />
      {props.legendText}
    </TouchableOpacity>
  );
};
