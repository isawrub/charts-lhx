import { useRef, useState, useLayoutEffect } from "react";
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
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const updateSize = () => {
          if (chartComponentRef.current) {
            const { clientWidth, clientHeight } = chartComponentRef.current;
            setDimensions({ width: clientWidth, height: clientHeight });
          }
        };
    
        // Initial size
        updateSize();
    
      }, []);
console.log("viewPort H",dimensions.height);    
    const options = {
        chart: {
            alignTicks: false,
            zooming: {
                type: 'x',
            },
            panKey: 'shift',
            height: dimensions.height,
            marginLeft: 200,
            marginRight: 40,
            type: 'stock',
            scrollablePlotArea: {
                minHeight: (labTestGroupsCount-1) * (150 + 40),
                scrollPositionY: 0,
                opacity: 0
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
            tickInterval: 365 * 24 * 3600,
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
        <div
            ref={chartComponentRef} className="patient-chart-view-container"
            style={{
                width: "100%",
                height: "150px",
                border: "1px solid gray",
                resize: "both",
                overflow: "visible"
            }}
        >
            <HighchartsReact highcharts={Highcharts} constructorType="chart" options={options} />
        </div>
    );
};

export default ChartAndMock;


