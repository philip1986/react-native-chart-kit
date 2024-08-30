// Mock data object used for LineChart and BarChart
import { Text } from "react-native";

const data = {
  labels: ["January", "February", "March", "April", "May", "June"],
  datasets: [
    {
      // data: [-50, -20, -2, 86, 71, 100],
      data: [1, 0, 1, 1, 1, 1],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
    },
    {
      data: [2, 3, 1, 4, 2, 2],
      color: (opacity = 1) => `rgba(0, 255, 255, ${opacity})`, // optional
    },
    // {
    //   data: [30, 90, 67, 54, 10, 2],
    // },
    // {
    //   data: [30, 90, 67, 54, 10, 2],
    // },
  ],
  // legend: ["Spielzeit (min)", "Gelesene Wörter", "one more", "one more"], // optional
  legend: [<Text>Spielzeit (min)</Text>, <Text>"Gelesene Wörter"</Text>], // optional
};

// Mock data object used for Contribution Graph

const contributionData = [
  { count: 0, date: "2024-05-24T00:00:00.000Z" },
  { count: 0, date: "2024-05-25T00:00:00.000Z" },
  { count: 0, date: "2024-05-26T00:00:00.000Z" },
  { count: 0, date: "2024-05-27T00:00:00.000Z" },
  { count: 0, date: "2024-05-28T00:00:00.000Z" },
  { count: 0, date: "2024-05-29T00:00:00.000Z" },
  { count: 0, date: "2024-05-30T00:00:00.000Z" },
  { count: 10, date: "2024-05-31T00:00:00.000Z" },
];

// Mock data object for Pie Chart

const pieChartData = [
  {
    name: "Seoul",
    population: 21500000,
    color: "rgba(131, 167, 234, .5)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Toronto",
    population: 2800000,
    color: "#F00",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Beijing",
    population: 527612,
    color: "red",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "New York",
    population: 8538000,
    color: "#ffffff",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Moscow",
    population: 11920000,
    color: "rgb(0, 0, 255)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
];

// Mock data object for Progress

const progressChartData = {
  labels: ["Swim", "Bike", "Run"], // optional
  data: [0.2, 0.5, 0.3],
};

const stackedBarGraphData = {
  labels: ["Test1", "Test2"],
  legend: ["L1", "L2", "L3"],
  data: [
    [60, 60, 60],
    [30, 30, 60],
  ],
  barColors: ["#dfe4ea", "#ced6e0", "#a4b0be"],
};

export {
  data,
  contributionData,
  pieChartData,
  progressChartData,
  stackedBarGraphData,
};
