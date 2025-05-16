import dash
from dash import dcc, html
import pandas as pd
import plotly.express as px
from dash.dependencies import Input, Output

# Load Data
file_path = "Training_Data - Cycling.csv"
df = pd.read_csv(file_path)

# Convert date column to datetime format
df["Date"] = pd.to_datetime(df["Date"], format="%d/%m/%y")

# Calculate Predicted RHR
df["Predicted RHR"] = df["Avg BPM"] - (df["Calories Burned"] / 100)

# Initialize Dash App
app = dash.Dash(__name__)

app.layout = html.Div([
    html.H1("Cycling Training Dashboard", style={"textAlign": "center"}),

    dcc.DatePickerRange(
        id="date-picker",
        min_date_allowed=df["Date"].min(),
        max_date_allowed=df["Date"].max(),
        start_date=df["Date"].min(),
        end_date=df["Date"].max(),
        display_format="DD/MM/YYYY",
        style={"margin": "10px auto", "textAlign": "center"}
    ),

    dcc.Graph(id="line-chart"),
    dcc.Graph(id="scatter-chart"),
])

@app.callback(
    [Output("line-chart", "figure"),
     Output("scatter-chart", "figure")],
    [Input("date-picker", "start_date"),
     Input("date-picker", "end_date")]
)
def update_graphs(start_date, end_date):
    filtered_df = df[(df["Date"] >= start_date) & (df["Date"] <= end_date)]

    # Line Chart: Avg BPM, Calories Burned, Predicted RHR
    fig1 = px.line(
        filtered_df, x="Date", y=["Avg BPM", "Predicted RHR"],
        labels={"value": "Heart Rate (BPM)", "Date": "Date"},
        title="Heart Rate Trends",
        markers=True
    )

    # Scatter Plot: Calories Burned vs Avg BPM
    fig2 = px.scatter(
        filtered_df, x="Calories Burned", y="Avg BPM",
        trendline="ols",
        title="Calories Burned vs Avg BPM",
        labels={"Calories Burned": "Calories Burned (kcal)", "Avg BPM": "Avg BPM"}
    )

    return fig1, fig2

if __name__ == "__main__":
    app.run_server(debug=True)
