import React from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { newMockData } from "./newMockData";
import './chart.css'

const parseDate = (rawDate) => {
    if (/^\d{14}$/.test(rawDate)) {
        const year = +rawDate.slice(0, 4);
        const month = +rawDate.slice(4, 6) - 1;
        const day = +rawDate.slice(6, 8);
        return Date.UTC(year, month, day);
    }

    const date = new Date(rawDate);
    return isNaN(date.getTime()) ? Date.now() : Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

const truncateString = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}


const ChartAndMock = () => {

    const yAxisHeight = 108; // height in pixels for each yAxis
    const spacing = 20; // spacing between charts in pixels

    const series = [];
    const yAxes = [];

    const labTestGroupsCount = newMockData.analyteEvents.length || 0;

    for (let i = 0; i < labTestGroupsCount; i++) {
        const analyte = newMockData.analyteEvents[i];
        const title = analyte.name;

        yAxes.push({
            title: {
                useHTML: true,
                text:
                    `<div style="
border: 0px solid green;
width: 155px;
height: 108px;
whiteSpace: 'normal';
border-right:0;
margin-left:-55px;
">
<div style="
padding: 1px 20x;
width: 155px;
overflow-wrap: break-word;
white-space: normal;
box-sizing: border-box;">${truncateString(title, 30)}</div>
</div>`,
                align: "high",
                rotation: 0,
                y: 14,
                x: 0,
                //lineWidth: ,
                // lineColor: 'red',
                style: {
                    fontWeight: "bold",
                    color: 'black',
                    fontSize: '14px',
                },
                textAlign: "left",
            },
            labels: {
                enabled: true,
                x: -20,// Ensures label values don’t shift over the title
                y: 5,  // fine-tune vertically
            },
            lineWidth: 0,  // y axisNo line for the title
            gridLineColor: '#e6e6e6',
            lineColor: 'red',
            tickColor: 'green',

            top: `${i * (yAxisHeight + spacing)}px`,
            height: `${yAxisHeight}px`,

            offset: 0,
            opposite: false,
            gridLineWidth: 1,

        });


        const seriesData = analyte.observations.map((obs, index) => {
            const obsEvent = obs.observationEvent;
            const interp = obsEvent?.interpretationRange?.interpretationCode;
            const range = obsEvent?.interpretationRange;

            const value = obsEvent?.value;

            if (value === null) {
                console.log("null--------------")
                return {
                    x: parseDate(obs.effectiveTime),
                    y: value === null || value === undefined || value === '' ? 0 : Number(value),
                    // dataLabels: { enabled: true, format: 'Not detected' },
                    // marker: { enabled: true, symbol: 'circle', fillColor: 'red' },
                    // y: null,
                    color: 'gray',
                        // interp?.code === 'HH' ? 'red' :
                        //     interp?.code === 'H' ? 'red' :
                        //         interp?.code === 'L' ? 'blue' :
                        //             'green',
                    unit: obsEvent?.unit,
                    code: interp?.code,
                    interpretationCode: interp,
                    rangeLow: range?.low,
                    rangeHigh: range?.high,
                    author: obs.batteryEvent?.author,
                    lab: obsEvent?.lab,
                    specimen: obs.batteryEvent?.specimen,
                };
            } else {
                return {
                    x: parseDate(obs.effectiveTime),
                    y: Number(obsEvent?.value),
                    // dataLabels: { enabled: true, format: 'Not detected' },
                    // marker: { enabled: true, symbol: 'circle', fillColor: 'red' },
                    // y: null,
                    color:
                        interp?.code === 'HH' ? 'red' :
                            interp?.code === 'H' ? 'red' :
                                interp?.code === 'L' ? 'blue' :
                                    'green',
                    unit: obsEvent?.unit,
                    code: interp?.code,
                    interpretationCode: interp,
                    rangeLow: range?.low,
                    rangeHigh: range?.high,
                    author: obs.batteryEvent?.author,
                    lab: obsEvent?.lab,
                    specimen: obs.batteryEvent?.specimen,
                };
            }


        });


        let isNotdetedValuesExist = seriesData.some((data) => data.y === null || data.y === 0);
        console.log("seriesData--------", title, seriesData, isNotdetedValuesExist)
        series.push({
            name: title,
            type: "line",
            yAxis: i,
            data: seriesData,
            // color: "black",
            color: 'blue',
            lineWidth: isNotdetedValuesExist ? 0 : 1,
            connectNulls: false,
            dataLabels: {
                enabled: true,
                formatter: function () {
                    return (this.y === 0) || (this.y === null) ? 'Not detected' : this.y;
                }
            },
            marker: {
                enabled: true
            }
        });
    }

    const options = {

        chart: {
            alignTicks: false,
            zooming: {
                type: 'x',
            },

            panKey: 'shift',
            width: 1150,
            height: 580,// labTestGroupsCount * (yAxisHeight + spacing),
            marginLeft: 200,
            marginRight: 20,
            type: 'stock',
            scrollablePlotArea: {
                minHeight: labTestGroupsCount * (yAxisHeight + spacing),
                scrollPositionY: 100,
            },
            borderColor: 'gray',
            borderWidth: 1,
            spacingTop: 0,
            spacingLeft: 20,
            spacingRight: 10,
            spacingBottom: 0,
            plotBorderColor: 'black',
            marginBottom: -100
        },
        title: {
            text: "",
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
                enabled: false,
                format: "{value:%Y}",
                rotation: 0,
                style: {
                    fontSize: '13px',
                    color: '#333'
                },
            },
        },
        yAxis: yAxes,

        tooltip: {
            split: false,
            shared: true,
            useHTML: true,
            stickOnContact: true, // keeps tooltip visible when near the point
            followPointer: false, // important: don't follow the mouse
            outside: false,
            shadow: false, // optional for better visuals
            formatter: function () {
                const obsPoint = this.points;
                const obs = obsPoint?.[0]?.point;
                // console.log("obs", obs[0].point)

                const date = Highcharts.dateFormat('%m/%d/%Y', obs.x);
                const value = obs.y;
                const unit = obs.unit || '';
                const interpretation = obs.interpretationCode?.code;
                const refRange = obs.rangeLow && obs.rangeHigh
                    ? `Ref. range: ${obs.rangeLow}-${obs.rangeHigh} ${unit}`
                    : null;

                const author = obs.author;
                const lab = obs.lab;
                const specimen = obs.specimen;

                const badgeColor =
                    interpretation === 'HH' ? '#dc2626' :
                        interpretation === 'H' ? '#dc2626' :
                            interpretation === 'LL' ? '#dc2626' :
                                interpretation === 'L' ? '#dc2626' : '#008000';

                // Use a unique ID for the button
                const btnId = `tooltip-btn-${author}-${date}-${lab}-${specimen}`;

                // Defer attaching click handler until after tooltip is rendered
                setTimeout(() => {
                    const btn = document.getElementById(btnId);
                    if (btn) {
                        btn.onclick = () => {
                            alert(`Clicked ${author} at ${date}: ${value}`);
                            // or call your custom function
                        };
                    }
                }, 0);

                return `<div style="font-family: 'Inter', sans-serif; background-color: white; margin: 0; display: flex; justify-content: center;">
              <div role="region" aria-label="Lab result" style=" max-width: 350px; width: 100%; padding: 16px; box-sizing: border-box;">
                <div style=" margin-bottom: 8px; text-align: center; font-weight: 600; font-size: 14px; color: #14532d; user-select: none;">
                ${date}
                </div>
                <div style="text-align: center; margin-bottom: 8px; font-size: 12px; color: black; font-weight: 400;">
                ${value} ${unit}
                  ${interpretation ? `<span aria-label="High High" style="display: inline-block; background-color: ${badgeColor}; color: white; font-weight: 600; font-size: 12px; border-radius: 9999px; padding: 4px 12px; margin-left: 8px; vertical-align: middle; user-select: none;">
                    ${interpretation}
                  </span>` : ''}
                </div>
                ${refRange ? `<p style="text-align: center; color: #4b5563; font-size: 12px; margin-bottom: 16px; user-select: none;">
                  ${refRange}
                </p>`: ''}
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
                  <div style="padding: 8px;  box-sizing: border-box; word-break: break-word;">
                    <p style="font-weight: 700; color: black; margin-bottom: 4px;">Ordering Physician</p>
                    <p style="color: black; margin: 0; line-height: 1.2;">${author || 'N/A'}</p>
                    <p style="color: black; margin: 0; line-height: 1.2;"></p>
                  </div>
                  <div style="padding: 8px;  box-sizing: border-box; text-align: center;">
                    <p style="font-weight: 700; color: black; margin-bottom: 4px;">Lab</p>
                    <p style="color: black; margin: 0;">SKB ${lab || 'N/A'} </p>
                  </div>
                  <div style="padding: 8px; box-sizing: border-box; text-align: center;">
                    <p style="font-weight: 700; color: black; margin-bottom: 4px;">Specimen</p>
                    <p style="color: black; margin: 0;"> ${specimen || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>`

            },

            positioner: function (labelWidth, labelHeight, point) {
                const chart = this.chart;

                const scrollY = chart.container.parentElement?.scrollTop || 0;
                const chartTop = chart.container.getBoundingClientRect().top;

                // Ideal base positions
                let x = point.plotX + chart.plotLeft + 10;
                let y = point.plotY + chart.plotTop - labelHeight - 10;

                const padding = 10;
                const leftPadding = 260;

                // Prevent going into Y-axis label space
                if (x < leftPadding) {
                    x = leftPadding;
                }

                // Prevent going off right edge
                if (x + labelWidth > chart.chartWidth) {
                    x = chart.chartWidth - labelWidth - padding;
                }

                // Prevent tooltip going above visible scroll container
                const viewportTop = chartTop + scrollY;
                const absoluteY = y + chart.container.offsetTop;

                if (absoluteY < viewportTop) {
                    y = point.plotY + chart.plotTop + 10;
                }

                return { x, y };
            }
        },
        plotOptions: {
            series: {
                pointPlacement: 'on',
                stickyTracking: true,
                marker: {
                    symbol: "circle",
                    enabled: true,
                    radius: 6,
                    lineWidth: 1,
                    lineColor: '#000',
                },
                color: 'red',
                dataLabels: {
                    // align: 'left',
                    // enabled: true,
                    // crop: false, // Do not crop data labels
                    // overflow: 'none', // Prevent overflow cutting
                    // formatter: function () {
                    //     return this.y?.toString();
                    // },
                    formatter: function () {
                        // return this.y !== undefined ? this.y.toString() : "N/A";
                        // return this.y !== undefined ? this.y.toString() : "N/A";
                        return this.y !== undefined || this.y === null || this.y === 0 ? 'Not detected' : this.y;

                    },
                },
                states: {
                    hover: {
                        enabled: true,
                        lineWidthPlus: 0
                    }
                },
                point: {
                    events: {
                        mouseOver: function () {
                            this.series.chart.tooltip.refresh(this);
                        }
                    }
                }
            },

        },
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
        // navigator: {
        //     enabled: true,
        // },
        navigator: {
            enabled: true,
            // height: 40, // Increase height
            // margin: 20, // Adds spacing from chart
            outlineColor: '#000000', // Make outline more visible
            maskFill: 'rgba(102, 133, 194, 0.3)', // Lighter mask
            series: {
                color: '#000000', // Contrast for mini line
                lineWidth: 1
            },
            xAxis: {
                labels: {
                    style: {
                        color: '#000000', // Make years readable
                        fontSize: '10px'
                    }
                }
            }
        }
        ,
        scrollbar: {
            enabled: true,
            showFull: false,
        },
    };

    return (
        <div style={{ marginTop: 10 }}>
            <HighchartsReact highcharts={Highcharts} constructorType="chart" options={options} />
        </div>
    );
};

export default ChartAndMock;
