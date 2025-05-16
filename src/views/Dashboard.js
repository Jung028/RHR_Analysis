import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { useInView } from 'react-intersection-observer';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  useEffect(() => {
    // Simulate data loading
    const fetchData = async () => {
      // In a real app, this would fetch from an API
      const mockData = {
        heartRate: [135, 127, 130, 126, 132, 129, 125, 130, 134, 127],
        dates: [
          '2023-11-24',
          '2023-11-26',
          '2023-11-29',
          '2023-12-02',
          '2023-12-05',
          '2023-12-08',
          '2023-12-11',
          '2023-12-14',
          '2023-12-17',
          '2023-12-20',
        ],
        speed: [23.5, 20.2, 22.5, 19.5, 24.0, 21.8, 23.2, 22.8, 24.5, 23.8],
        power: [205, 175, 195, 175, 210, 185, 200, 195, 215, 205],
        cadence: [68, 58, 66, 56, 70, 62, 68, 65, 72, 67],
      };
      setData(mockData);
    };

    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  const heartRatePlot = {
    data: [
      {
        x: data.dates,
        y: data.heartRate,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: '#2196f3' },
      },
    ],
    layout: {
      title: 'Heart Rate Over Time',
      xaxis: { title: 'Date' },
      yaxis: { title: 'Heart Rate (BPM)' },
      height: 400,
    },
  };

  const correlationPlot = {
    data: [
      {
        x: ['Avg BPM', 'Avg Speed', 'Avg Power', 'Avg Cadence'],
        y: ['Avg BPM', 'Avg Speed', 'Avg Power', 'Avg Cadence'],
        z: [
          [1.0, 0.85, 0.75, 0.65],
          [0.85, 1.0, 0.90, 0.80],
          [0.75, 0.90, 1.0, 0.70],
          [0.65, 0.80, 0.70, 1.0],
        ],
        type: 'heatmap',
        colorscale: 'Viridis',
      },
    ],
    layout: {
      title: 'Correlation Matrix',
      height: 400,
    },
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Average Heart Rate</Typography>
              <Typography variant="h3" color="primary">
                {data.heartRate.reduce((a, b) => a + b, 0) / data.heartRate.length} BPM
              </Typography>
              <Typography color="textSecondary">
                Based on {data.heartRate.length} sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Average Speed</Typography>
              <Typography variant="h3" color="primary">
                {(data.speed.reduce((a, b) => a + b, 0) / data.speed.length).toFixed(1)} MPH
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Average Power</Typography>
              <Typography variant="h3" color="primary">
                {(data.power.reduce((a, b) => a + b, 0) / data.power.length).toFixed(1)} W
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Average Cadence</Typography>
              <Typography variant="h3" color="primary">
                {(data.cadence.reduce((a, b) => a + b, 0) / data.cadence.length).toFixed(1)} RPM
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Plots */}
        <Grid item xs={12} md={6}>
          <Card ref={ref}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Heart Rate Over Time
              </Typography>
              <Plot data={heartRatePlot.data} layout={heartRatePlot.layout} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Correlation Matrix
              </Typography>
              <Plot data={correlationPlot.data} layout={correlationPlot.layout} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
