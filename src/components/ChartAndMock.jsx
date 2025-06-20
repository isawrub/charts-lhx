import { useRef } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { generateChartConfig, getCustomTooltipConfig, getNavigatorOptionsConfig, getPlotOptionsConfig, parseVisitingDate } from "./utils";
import { newMockData } from "./newMockData";
import './chart.css';


const ChartAndMock = () => {

    const analyteEvents = newMockData.analyteEvents;
    const { yAxes, series } = generateChartConfig(analyteEvents, 150, 20, parseVisitingDate);

    const labTestGroupsCount = analyteEvents?.length || 0;

    const chartComponentRef = useRef(null);
    const options = {
        chart: {
            alignTicks: false,
            zooming: {
                type: 'x',
            },
            panKey: 'shift',
            height: 480,
            marginLeft: 200,
            marginRight: 40,
            type: 'stock',
            scrollablePlotArea: {
                minHeight: labTestGroupsCount * (150 + 20),
                scrollPositionY: 100,
            },
            borderColor: '#e6e6e6',
            borderWidth: 1,
            spacingTop: 0,
            spacingLeft: 10,
            spacingRight: 10,
            spacingBottom: -15,
            plotBorderColor: 'black',
            marginBottom: -100
        },
        title: {
            text: '', // Title of the chart if needed
        },
        xAxis: {
            reversed: true,
            type: "datetime",
            tickInterval: 365 * 24 * 3600 * 1000,
            lineColor: 'white',
            lineWidth: 1,
            gridLineWidth: 0,
            tickLength: 0,
            gridLineColor: '#e6e6e6',
            labels: {
                enabled: true,
                format: "{value:%Y}",
                rotation: 0,
                style: {
                    fontSize: '14px',
                    color: '#333'
                },
            },
        },
        yAxis: yAxes,
        tooltip: getCustomTooltipConfig(),
        plotOptions: getPlotOptionsConfig(),
        series,
        legend: {
            enabled: false,
        },
        credits: {
            enabled: false,
        },
        rangeSelector: {
            enabled: false,
        },
        navigator: getNavigatorOptionsConfig(),
        scrollbar: {
            enabled: true,
            showFull: false,
        },
    };
    // test comments testing
    return (
        <div ref={chartComponentRef} className="patient-chart-view-container">
            <HighchartsReact highcharts={Highcharts} constructorType="chart" options={options} />
        </div>
    );
};

export default ChartAndMock;


