import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { useInView } from 'react-intersection-observer';


// Helper functions for calculations
const calculateZones = (values, thresholds) => {
  const zoneCounts = new Array(thresholds.length + 1).fill(0);
  values.forEach(value => {
    for (let i = 0; i < thresholds.length; i++) {
      if (value <= thresholds[i]) {
        zoneCounts[i]++;
        return;
      }
    }
    zoneCounts[thresholds.length]++;
  });
  return zoneCounts;
};

const calculateEfficiency = (speeds, powers) => {
  const efficiencies = [];
  speeds.forEach((speed, index) => {
    if (powers[index] > 0) {
      efficiencies.push(speed / (powers[index] / 100)); // Convert power to W/kg for better comparison
    }
  });
  return efficiencies;
};

const calculateTrend = (values) => {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const trend = values[values.length - 1] - values[0];
  return { avg, trend };
};

const calculateDistribution = (values) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const bins = 10;
  const binSize = range / bins;
  const distribution = new Array(bins).fill(0);
  
  values.forEach(value => {
    const bin = Math.floor((value - min) / binSize);
    if (bin >= 0 && bin < bins) {
      distribution[bin]++;
    }
  });
  
  return {
    bins: Array.from({ length: bins }, (_, i) => min + (i * binSize)),
    distribution
  };
};

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mockData = {
          trainingLoad: [2.5, 2.0, 2.3, 1.8, 2.8, 2.2, 2.5, 2.4, 2.9, 2.3],
          fatigueIndex: [1.2, 1.5, 1.3, 1.6, 1.1, 1.4, 1.2, 1.3, 1.0, 1.4],
          efficiencyIndex: [0.45, 0.42, 0.44, 0.40, 0.48, 0.43, 0.45, 0.44, 0.49, 0.44],
          heartRate: [130, 140, 150, 160, 170, 180, 190, 200, 210, 220],
          power: [180, 200, 220, 240, 260, 280, 300, 320, 340, 360],
          speed: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
          dates: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10'],
          normalizedPower: [200, 210, 220, 230, 240, 250, 260, 270, 280, 290],
          intensityFactor: [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15],
          trainingStressScore: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
          vam: [1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450],
          heartRateVariability: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
          recoveryIndex: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1],
          cadence: [90, 92, 94, 96, 98, 100, 102, 104, 106, 108]
        };
        setData(mockData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  // Calculate metrics
  const heartRateZones = calculateZones(data.heartRate, [130, 140, 150, 160]);
  const powerZones = calculateZones(data.power, [180, 200, 220, 240]);
  const efficiencies = calculateEfficiency(data.speed, data.power);
  const heartRateTrend = calculateTrend(data.heartRate);
  const speedTrend = calculateTrend(data.speed);
  const powerTrend = calculateTrend(data.power);
  const avgNormalizedPower = data.normalizedPower.reduce((a, b) => a + b, 0) / data.normalizedPower.length;
  const avgIntensityFactor = data.intensityFactor.reduce((a, b) => a + b, 0) / data.intensityFactor.length;
  const avgTrainingStressScore = data.trainingStressScore.reduce((a, b) => a + b, 0) / data.trainingStressScore.length;
  const avgVAM = data.vam.reduce((a, b) => a + b, 0) / data.vam.length;
  const avgHRV = data.heartRateVariability.reduce((a, b) => a + b, 0) / data.heartRateVariability.length;
  const avgRecoveryIndex = data.recoveryIndex.reduce((a, b) => a + b, 0) / data.recoveryIndex.length;
  const avgTrainingLoad = data.trainingLoad.reduce((a, b) => a + b, 0) / data.trainingLoad.length;
  const avgFatigueIndex = data.fatigueIndex.reduce((a, b) => a + b, 0) / data.fatigueIndex.length;
  const avgEfficiencyIndex = data.efficiencyIndex.reduce((a, b) => a + b, 0) / data.efficiencyIndex.length;

  // Create plots
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

  const efficiencyPlot = {
    data: [
      {
        x: data.dates,
        y: efficiencies,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: '#4caf50' }
      }
    ],
    layout: {
      title: 'Power-to-Speed Efficiency',
      xaxis: { title: 'Date' },
      yaxis: { title: 'Efficiency (MPH/W/kg)' },
      height: 400,
    },
  };

  const zoneDistribution = {
    data: [
      {
        labels: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
        values: heartRateZones,
        type: 'pie',
        hole: 0.4,
        marker: {
          colors: ['#1e88e5', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9']
        }
      }
    ],
    layout: {
      title: 'Heart Rate Zone Distribution',
      height: 400,
    },
  };

  const workoutDuration = {
    data: [
      {
        x: data.dates,
        y: data.duration,
        type: 'bar',
        marker: { color: '#2196f3' }
      }
    ],
    layout: {
      title: 'Workout Duration',
      xaxis: { title: 'Date' },
      yaxis: { title: 'Duration (minutes)' },
      height: 400,
    },
  };

  const elevationPlot = {
    data: [
      {
        x: data.dates,
        y: data.elevationGain,
        type: 'bar',
        marker: { color: '#f50057' }
      }
    ],
    layout: {
      title: 'Elevation Gain',
      xaxis: { title: 'Date' },
      yaxis: { title: 'Elevation Gain (meters)' },
      height: 400,
    },
  };

  const powerDistribution = {
    data: [
      {
        x: data.power,
        type: 'histogram',
        marker: { color: '#4caf50' }
      }
    ],
    layout: {
      title: 'Power Distribution',
      xaxis: { title: 'Power (W)' },
      yaxis: { title: 'Frequency' },
      height: 400,
    },
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Key Performance Metrics */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Key Performance Metrics
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

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
              <Typography variant="body2" color="textSecondary">
                Trend: {heartRateTrend.trend > 0 ? '↑' : '↓'} {Math.abs(heartRateTrend.trend)} BPM
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Normalized Power</Typography>
              <Typography variant="h3" color="primary">
                {avgNormalizedPower.toFixed(1)} W
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Intensity Factor: {avgIntensityFactor.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Training Stress Score</Typography>
              <Typography variant="h3" color="primary">
                {avgTrainingStressScore.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Higher scores indicate more intense workouts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">VAM (Vertical Speed)</Typography>
              <Typography variant="h3" color="primary">
                {avgVAM.toFixed(1)} m/h
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average climbing speed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Analysis */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Performance Analysis
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Heart Rate vs Speed Over Time
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Shows the relationship between heart rate and speed across workouts
              </Typography>
              <Plot data={heartRatePlot.data} layout={heartRatePlot.layout} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Power-to-Speed Efficiency
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Higher values indicate better efficiency - more speed for less power
              </Typography>
              <Plot data={efficiencyPlot.data} layout={efficiencyPlot.layout} />
            </CardContent>
          </Card>
        </Grid>

        {/* Training Load Analysis */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Training Load Analysis
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Heart Rate Zone Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Shows time spent in different heart rate zones
              </Typography>
              <Plot data={zoneDistribution.data} layout={zoneDistribution.layout} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Workout Duration Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Shows typical workout durations
              </Typography>
              <Plot data={workoutDuration.data} layout={workoutDuration.layout} />
            </CardContent>
          </Card>
        </Grid>

        {/* Recovery Metrics */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Recovery Metrics
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Heart Rate Variability</Typography>
              <Typography variant="h3" color="primary">
                {avgHRV} ms
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Higher values indicate better recovery
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recovery Index</Typography>
              <Typography variant="h3" color="primary">
                {avgRecoveryIndex.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Target range: 0.75-0.85
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Fatigue Index</Typography>
              <Typography variant="h3" color="primary">
                {avgFatigueIndex.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Lower values indicate better recovery
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Charts */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Additional Insights
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Elevation Gain Over Time
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Shows climbing volume across workouts
              </Typography>
              <Plot data={elevationPlot.data} layout={elevationPlot.layout} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Power Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Shows power output distribution across workouts
              </Typography>
              <Plot data={powerDistribution.data} layout={powerDistribution.layout} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  if (!data) return <div>Loading...</div>;

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Key Performance Metrics */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Key Performance Metrics
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

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
              <Typography variant="body2" color="textSecondary">
                Trend: {heartRateTrend.trend > 0 ? '↑' : '↓'} {Math.abs(heartRateTrend.trend)} BPM
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Normalized Power</Typography>
              <Typography variant="h3" color="primary">
                {avgNormalizedPower.toFixed(1)} W
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Intensity Factor: {avgIntensityFactor.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Training Stress Score</Typography>
              <Typography variant="h3" color="primary">
                {avgTrainingStressScore.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Higher scores indicate more intense workouts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">VAM (Vertical Speed)</Typography>
              <Typography variant="h3" color="primary">
                {avgVAM.toFixed(1)} m/h
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average climbing speed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Analysis */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Performance Analysis
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Heart Rate vs Speed Over Time
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Shows the relationship between heart rate and speed across workouts
              </Typography>
              <Plot data={heartRatePlot.data} layout={heartRatePlot.layout} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Power-to-Speed Efficiency
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Higher values indicate better efficiency - more speed for less power
              </Typography>
              <Plot data={efficiencyPlot.data} layout={efficiencyPlot.layout} />
            </CardContent>
          </Card>
        </Grid>

        {/* Training Load Analysis */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Training Load Analysis
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Heart Rate Zone Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Shows time spent in different heart rate zones
              </Typography>
              <Plot data={zoneDistribution.data} layout={zoneDistribution.layout} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Power Distribution
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Shows power output distribution across workouts
              </Typography>
              <Plot data={powerDistribution.data} layout={powerDistribution.layout} />
            </CardContent>
          </Card>
        </Grid>

        {/* Recovery Metrics */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Recovery Metrics
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Heart Rate Variability</Typography>
              <Typography variant="h3" color="primary">
                {avgHRV} ms
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Higher values indicate better recovery
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recovery Index</Typography>
              <Typography variant="h3" color="primary">
                {avgRecoveryIndex.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Target range: 0.75-0.85
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Fatigue Index</Typography>
              <Typography variant="h3" color="primary">
                {avgFatigueIndex.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Lower values indicate better recovery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
