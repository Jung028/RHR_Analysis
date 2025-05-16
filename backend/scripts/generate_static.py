import pandas as pd
import plotly.express as px
import json
import os
from jinja2 import Environment, FileSystemLoader

def load_data():
    df = pd.read_csv('Training_Data - Cycling.csv')
    # Clean Avg BPM data by removing 'bpm' and converting to numeric
    df['Avg BPM'] = df['Avg BPM'].str.replace(' bpm', '').astype(float)
    return df

def generate_plots(df):
    # Clean and prepare data
    df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%y')
    
    # Clean numerical columns
    def clean_value(value):
        if pd.isna(value):
            return None
        try:
            # Try to remove units and convert to float
            return float(str(value).split()[0])
        except:
            return None
    
    df['Avg BPM'] = df['Avg BPM'].apply(clean_value)
    df['Avg Speed'] = df['Avg Speed (MPH)'].apply(clean_value)
    df['Avg Watt'] = df['Avg Watt'].apply(clean_value)
    df['Avg RPM'] = df['Avg RPM'].apply(clean_value)
    
    # Drop any rows with missing values after cleaning
    df = df.dropna(subset=['Avg BPM', 'Avg Speed', 'Avg Watt', 'Avg RPM'])
    
    # Create heart rate over time plot
    fig_hr = px.line(df, x='Date', y='Avg BPM', title='Heart Rate Over Time')
    heart_rate_plot = fig_hr.to_html(full_html=False)
    
    # Create correlation heatmap
    correlation_matrix = df[['Avg BPM', 'Avg Speed', 'Avg Watt', 'Avg RPM']].corr()
    fig_corr = px.imshow(correlation_matrix, 
                        labels=dict(x="Metrics", y="Metrics", color="Correlation"),
                        x=['Avg BPM', 'Avg Speed', 'Avg Watt', 'Avg RPM'],
                        y=['Avg BPM', 'Avg Speed', 'Avg Watt', 'Avg RPM'])
    correlation_plot = fig_corr.to_html(full_html=False)
    
    # Create speed vs heart rate scatter plot
    fig_speed_hr = px.scatter(df, x='Avg Speed', y='Avg BPM', 
                             title='Heart Rate vs Speed',
                             trendline='ols',
                             trendline_color_override='red')
    speed_hr_plot = fig_speed_hr.to_html(full_html=False)
    
    # Create power vs heart rate scatter plot
    fig_power_hr = px.scatter(df, x='Avg Watt', y='Avg BPM', 
                             title='Heart Rate vs Power Output',
                             trendline='ols',
                             trendline_color_override='red')
    power_hr_plot = fig_power_hr.to_html(full_html=False)
    
    # Create weekly heart rate trend
    df['Week'] = df['Date'].dt.to_period('W')
    weekly_avg = df.groupby('Week')['Avg BPM'].mean().reset_index()
    # Convert Period to string for plotting
    weekly_avg['Week'] = weekly_avg['Week'].astype(str)
    fig_weekly = px.line(weekly_avg, x='Week', y='Avg BPM', 
                        title='Weekly Heart Rate Trend')
    weekly_trend_plot = fig_weekly.to_html(full_html=False)
    
    # Create stats
    stats = {
        'mean_heartrate': df['Avg BPM'].mean(),
        'max_heartrate': df['Avg BPM'].max(),
        'min_heartrate': df['Avg BPM'].min(),
        'total_time': len(df) / 60,
        'avg_speed': df['Avg Speed'].mean(),
        'avg_power': df['Avg Watt'].mean(),
        'avg_cadence': df['Avg RPM'].mean(),
        'most_efficient_session': df.loc[df['Avg BPM'].idxmin(), 'Date'].strftime('%Y-%m-%d'),
        'most_intense_session': df.loc[df['Avg BPM'].idxmax(), 'Date'].strftime('%Y-%m-%d')
    }
    
    return heart_rate_plot, correlation_plot, speed_hr_plot, power_hr_plot, weekly_trend_plot, stats

def generate_html(heart_rate_plot, correlation_plot, speed_hr_plot, power_hr_plot, weekly_trend_plot, stats):
    env = Environment(loader=FileSystemLoader('templates'))
    template = env.get_template('index.html')
    
    # Format stats for display
    formatted_stats = {
        'mean_heartrate': f"{stats['mean_heartrate']:.1f}",
        'max_heartrate': f"{stats['max_heartrate']:.1f}",
        'min_heartrate': f"{stats['min_heartrate']:.1f}",
        'total_time': f"{stats['total_time']:.1f}",
        'avg_speed': f"{stats['avg_speed']:.1f}",
        'avg_power': f"{stats['avg_power']:.1f}",
        'avg_cadence': f"{stats['avg_cadence']:.1f}",
        'most_efficient_session': stats['most_efficient_session'],
        'most_intense_session': stats['most_intense_session']
    }
    
    return template.render(
        heart_rate_plot=heart_rate_plot,
        correlation_plot=correlation_plot,
        speed_hr_plot=speed_hr_plot,
        power_hr_plot=power_hr_plot,
        weekly_trend_plot=weekly_trend_plot,
        stats=formatted_stats
    )

def main():
    # Create build directory if it doesn't exist
    if not os.path.exists('build'):
        os.makedirs('build')
    
    # Load data and generate plots
    df = load_data()
    heart_rate_plot, correlation_plot, speed_hr_plot, power_hr_plot, weekly_trend_plot, stats = generate_plots(df)
    
    # Generate HTML
    html_content = generate_html(heart_rate_plot, correlation_plot, speed_hr_plot, power_hr_plot, weekly_trend_plot, stats)
    
    # Write to build directory
    with open('build/index.html', 'w') as f:
        f.write(html_content)

if __name__ == '__main__':
    main()
