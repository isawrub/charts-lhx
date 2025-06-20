
import Highcharts from "highcharts/highstock";
import { newMockData } from "./newMockData";
// import { NOT_DETECTED } from "../patient-demographics/constant";
// import { NOT_AVAILABLE, REF_RANGE } from "./constant";

const NOT_AVAILABLE = 'N/A'

const NOT_DETECTED = 'Not detected';

const REF_RANGE = 'Ref. Range.'

/**
 * Converts a raw date string to a UTC timestamp (in milliseconds).
 * 
 * - If the input is a 14-digit string (e.g., '20250409091100'), it extracts the year, month, and day,
 *   and returns a UTC timestamp (ignoring time parts).
 * - If the input is in another format (e.g., ISO string), it attempts to parse it as a Date.
 * - If parsing fails (invalid date), it returns the current timestamp.
 */

export const parseVisitingDate = (rawDate) => {
    if (/^\d{14}$/.test(rawDate)) {
        const year = +rawDate.slice(0, 4);
        const month = +rawDate.slice(4, 6) - 1;
        const day = +rawDate.slice(6, 8);
        return Date.UTC(year, month, day);
    }

    const date = new Date(rawDate);
    return isNaN(date.getTime()) ? Date.now() : Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};


/**
 * Represents the structure of the configuration returned for a Highcharts chart.
 * 
 * - `yAxes`: An array of Y-axis configuration objects used to render separate vertical axes
 *   (typically one per lab test group).
 * - `series`: An array of data series configurations used to plot the actual lab result values
 *   on their corresponding Y-axes.
 *   Interface defining the structure of chart configuration returned by generateChartConfig
 */
// export interface ChartConfig {
//     yAxes: Highcharts.YAxisOptions[];
//     series: Highcharts.SeriesOptionsType[];
// }

/**
 * Generates Highcharts chart configuration including multiple Y-axes and corresponding data series.
 *
 * @param patientViewMockData - The mock data containing analyte events and their observations.
 * @param yAxisHeight - The height (in pixels) for each Y-axis (i.e., each analyte chart).
 * @param spacing - The vertical spacing (in pixels) between each Y-axis/chart block.
 * @param parseDate - A utility function to convert date strings into UTC timestamps for the X-axis.
 *
 * @returns An object containing:
 *  - `yAxes`: Configurations for vertically stacked Y-axes, one per analyte.
 *  - `series`: Data series to be plotted on the corresponding Y-axes.
 *
 * This function dynamically constructs a vertical multi-panel chart by:
 * - Iterating over each analyte group.
 * - Creating a Y-axis with custom HTML labels and spacing.
 * - Mapping observations into data points with timestamp (x), value (y), color (based on interpretation),
 *   and other metadata for tooltip rendering.
 */

const analyteEvents = newMockData.analyteEvents;

const yAxisHeight = 150
const spacing = 20

export const generateChartConfig = () => {
    const yAxes = [];
    const series = [];
    const labTestGroupsCount = analyteEvents?.length;
    for (let i = 0; i < labTestGroupsCount; i++) {
        const analyte = analyteEvents[i];
        const title = analyte.name;

        yAxes.push({
            title: {
                useHTML: true,
                text: `
                <div style="
                width: 162px;
                height: 152px;
                margin-left: -25px;
                padding-left: 10px;
                padding-top:10px;
                whiteSpace: 'normal';
                border-bottom:1px solid #e6e6e6;
                ">
                <div style="
                padding: 1px 20x;
                width: 155px;
                overflow-wrap: break-word;
                white-space: normal;
                box-sizing: border-box;">${truncateMaxLengthString(title, 30)}</div>
                </div>`,
                align: "high",
                rotation: 0,
                y: i + 1 === labTestGroupsCount ? 50 : 14,
                x: 0,
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
            lineWidth: 0,
            gridLineColor: '#e6e6e6',
            top: `${i * (yAxisHeight + spacing)}px`,
            height: `${yAxisHeight}px`,
            offset: 0,
            opposite: false,
            gridLineWidth: 1,
        });


        const seriesData = analyte.observations.map((obs) => {
            const obsEvent = obs.observationEvent;
            const interp = obsEvent?.interpretationRange?.interpretationCode;
            const range = obsEvent?.interpretationRange;
            const value = obsEvent?.value;

            if (value === null) {
                return {
                    x: parseVisitingDate(obs.effectiveTime),
                    y: value === null || value === undefined || value === '' ? 0 : Number(value),
                    color: '#E8E8E8',
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
                    x: parseVisitingDate(obs.effectiveTime),
                    y: Number(obsEvent?.value),
                    color:
                        interp?.code === 'HH' ? '#dc2626' :
                            interp?.code === 'H' ? '#dc2626' :
                                interp?.code === 'LL' ? '#dc2626' :
                                    interp?.code === 'L' ? '#dc2626' : '#008000',
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
        series.push({
            name: title,
            type: "line",
            yAxis: i,
            data: seriesData,
            color: 'black',
            lineWidth: isNotdetedValuesExist ? 0 : 1,
            connectNulls: false,
            dataLabels: {
                enabled: true,
                formatter: function () {
                    return (this.y === 0) || (this.y === null) ? 'Not detected' : this.y;
                },
            },
            marker: {
                enabled: true
            },

        });
    }
    return { yAxes, series };
};

/**
 * Returns a custom Highcharts tooltip configuration for displaying detailed lab observation data.
 *
 * Tooltip Features:
 * - Shared: Allows showing one tooltip per hovered X value across multiple series.
 * - useHTML: Enables complex and styled tooltip content via HTML.
 * - stickOnContact & shadow: Keeps the tooltip visible and styled while hovering.
 * - formatter: Custom logic to dynamically build tooltip content using observation metadata.
 *
 * Tooltip Content Includes:
 * - Formatted date from `obs.x` using Highcharts' date formatter.
 * - Measured value (`obs.y`) with unit.
 * - Interpretation badge (color-coded for H, HH, L).
 * - Reference range, if available.
 * - Ordering physician, lab, and specimen info in a grid layout.
 * - A "Print" button with a unique ID and attached click event that shows an alert.
 *
 * Accessibility & Styling:
 * - Uses ARIA labels and roles for semantic structure.
 * - Inline styles are used for layout, spacing, and colors (no external CSS dependency).
 * - Button includes SVG icon and accessible label.
 *
 * Note:
 * - `setTimeout` is used to attach a click handler to the dynamically rendered tooltip button.
 *   This is required because the tooltip DOM is injected after the formatter runs.
 *
 * @returns Highcharts.TooltipOptions - customized tooltip configuration for lab results chart.
 */

export const getCustomTooltipConfig = () => (
    {
        split: false,
        shared: false,
        useHTML: true,
        stickOnContact: true, // keeps tooltip visible when near the point
        followPointer: false, // important: don't follow the mouse
        outside: false,
        shadow: false, // optional for better visuals
        formatter: function () {
            const obs = this;

            const date = Highcharts.dateFormat('%m/%d/%Y', obs.x);
            const value = obs.y;
            const unit = obs.unit || '';
            const interpretation = obs.interpretationCode?.code;
            const refRange = obs.rangeLow && obs.rangeHigh
                ? `${REF_RANGE} ${obs.rangeLow}-${obs.rangeHigh} ${unit}`
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
            return `<div style="font-family: 'Inter', sans-serif; background-color: white;
            box-shadow:0px 0px 24px 0px rgba(181,181,183,0.50); margin: 0; display: flex; justify-content: center;">
              <div role="region" aria-label="Lab result" style=" max-width: 350px; width: 100%; padding: 16px; box-sizing: border-box;">
                <div style=" margin-bottom: 8px; text-align: center; font-weight: 600; font-size: 14px; color: #034C1F; user-select: none;">
                ${date}
                </div>
                <div style="text-align: center; margin-bottom: 8px; font-size: 12px; color: black; font-weight: 400;">
                ${value} ${unit}
                  ${interpretation ? `<span aria-label="High High" style="display: inline-block; background-color: ${badgeColor}; color: white; font-weight: 600; font-size: 12px; border-radius: 9999px; padding: 4px 12px; margin-left: 8px; vertical-align: middle; user-select: none;">
                    ${interpretation}
                  </span>` : ''}
                </div>
                ${refRange ? `<p style="text-align: center; color: #151515; font-size: 12px; margin-bottom: 16px; user-select: none;">
                  ${refRange}
                </p>`: ''}
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
                  <div style="padding: 0px 8px;  box-sizing: border-box; word-break: break-word;">
                    <p style="font-weight: 700; color: black; margin-bottom: 4px;">Ordering Physician</p>
                    <p style="color: black; margin: 0; line-height: 1.2;">${author || NOT_AVAILABLE}</p>
                    <p style="color: black; margin: 0; line-height: 1.2;"></p>
                  </div>
                  <div style="padding: 0px 8px;  box-sizing: border-box; text-align: center;">
                    <p style="font-weight: 700; color: black; margin-bottom: 4px;">Lab</p>
                    <p style="color: black; margin: 0;">SKB ${lab || NOT_AVAILABLE} </p>
                  </div>
                  <div style="padding: 0px 8px; box-sizing: border-box; text-align: center;">
                    <p style="font-weight: 700; color: black; margin-bottom: 4px;">Specimen</p>
                    <p style="color: black; margin: 0;"> ${specimen || NOT_AVAILABLE}</p>
                  </div>
                </div>
              </div>
            </div>`
        },
    }
);


/**
 * Returns a custom Highcharts PlotOptions configuration for the series in a chart.
 *
 * Key Features:
 * - `connectNulls: false`: Ensures data points with null values are not connected by lines.
 * - `stickyTracking: true`: Keeps tooltip tracking active across the whole plot area, making it easier to interact with points.
 *
 * Marker Configuration:
 * - Displays circular markers on each data point with:
 *   - Radius: 6px
 *   - Black border (`lineColor: "#000"`) with 2px width
 *   - Marker is always enabled for better visibility of individual points.
 *
 * Data Labels:
 * - Enabled to show the `y` value next to each point.
 * - Left-aligned to avoid overlapping the marker.
 * - If `y` is `undefined`, displays "Not Detected" instead.
 *
 * Hover State:
 * - Maintains line thickness (`lineWidthPlus: 0`) during hover — no visual line width change.
 *
 * Point Events:
 * - `mouseOver`: When hovering over a point, explicitly refreshes the tooltip
 *   to ensure the custom formatter displays accurate data, even when shared tooltips are enabled.
 *
 * @returns Highcharts.PlotOptions - customized plot options for line series visualization.
 */

export const getPlotOptionsConfig = () => (
    {
        series: {
            pointPlacement: 'on',
            stickyTracking: true,
            marker: {
                symbol: "circle",
                enabled: true,
                radius: 6,
                lineWidth: 1,
                lineColor: '#000',
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'white',
                        lineWidth: 2, // thicker border on hover
                        radiusPlus: 0 // don't change size
                    }
                }
            },

            states: {
                hover: {
                    enabled: true,
                    lineWidthPlus: 0,
                    halo: {
                        size: 10, // outer circle size
                        opacity: 1, // soft red glow
                        attributes: {
                            fill: 'pink'
                        }
                    }
                }
            },
            color: 'red',
            dataLabels: {
                formatter: function () {
                    return this.y !== undefined || this.y === null || this.y === 0 ? NOT_DETECTED : this.y;
                },
            },

            point: {
                events: {
                    mouseOver: function () {
                        this.series.chart.tooltip.refresh(this);
                    }
                }
            }
        },
    }
);

export const truncateMaxLengthString = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}



// NavigatorOptions for the high chart component
export const getNavigatorOptionsConfig = () => ({
    height: 35,
    enabled: true,
    outlineColor: 'rgba(117, 148, 209, 0.3)', // Make outline more visible
    maskFill: 'rgba(147, 175, 229, 0.3)', // Lighter mask
    series: {
        color: 'transparent', // Contrast for mini line
        lineWidth: 1
    },
    xAxis: {
        reversed: true,
        labels: {
            style: {
                color: '#000000', // Make years readable
                fontSize: '10px'
            }
        }
    },
    handles: {
        backgroundColor: '#666',
        borderColor: '#AAA',
        symbols: ['diamond', 'diamond'], // left and right handles
        width: 8,
        height: 8
    }
})