document.addEventListener('DOMContentLoaded', function() {
  // Arrays to store sensor data
  let voltageData = [];
  let currentData = [];
  let powerData = [];
  let solarRadianceData = [];
  let energyData = [];
  const MAX_ENTRIES = 8;
  const MAX1_ENTRIES = 5; // Maximum number of entries to display

  // Chart instances
  let solarRadianceChart;
  let powerOutputChart;
  let energyStorageChart;


  // Function to fetch data from ThingSpeak
  function fetchData() {
    const CHANNEL_ID = '2483083';
    const READ_API_KEY = 'DP9O6Y3ARO0N5EO3';
    const FIELD_VOLTAGE = 'field1';
    const FIELD_CURRENT = 'field2';

    fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=${MAX_ENTRIES}&api_key=${READ_API_KEY}`)
      .then(response => response.json())
      .then(data => {
        // Extract data from response
        voltageData = data.feeds.map(feed => parseFloat(feed[FIELD_VOLTAGE]));
        currentData = data.feeds.map(feed => parseFloat(feed[FIELD_CURRENT]));

        // Calculate power from voltage and current
        powerData = voltageData.map((voltage, index) => voltage * currentData[index]);

        // Calculate energy increment for the latest hour
        const latestEnergyIncrement = powerData.reduce((acc, power) => acc + power, 0) / 3600; // Divide by 3600 to get kWh
        energyData.push(latestEnergyIncrement);

        // Update solar radiance data with voltage
        solarRadianceData = voltageData;

        // Update meter readings and charts
        updateMeterReadings();
        updateSolarRadianceChart();
        updatePowerOutputChart();
        updateEnergyStorageChart();

      })
      .catch(error => console.error('Error fetching data:', error));
  }

  // Initial fetch when the page loads
  fetchData();

  // Fetch data periodically (every 5 seconds)
  setInterval(fetchData, 5000);

  // Function to update meter readings
  function updateMeterReadings() {
    // Update voltage value
    document.getElementById('voltage').innerText = voltageData[voltageData.length - 1].toFixed(2) + ' V';
    // Update current value
    document.getElementById('current').innerText = currentData[currentData.length - 1].toFixed(2) + ' A';
    // Update power value
    document.getElementById('power').innerText = powerData[powerData.length - 1].toFixed(2) + ' W';
    
  }

  // Function to update solar radiance chart
  function updateSolarRadianceChart() {
    if (solarRadianceChart) {
      solarRadianceChart.destroy();
    }

    const solarRadianceCtx = document.getElementById('solarRadianceChart').getContext('2d');
    solarRadianceChart = new Chart(solarRadianceCtx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: solarRadianceData.length }, (_, i) => `Data ${i + 1}`),
        datasets: [{
          label: 'Solar Radiance (V)',
          data: solarRadianceData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red with transparency
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Function to update power output chart
  function updatePowerOutputChart() {
    if (powerOutputChart) {
      powerOutputChart.destroy();
    }

    const powerOutputCtx = document.getElementById('powerOutputChart').getContext('2d');
    powerOutputChart = new Chart(powerOutputCtx, {
      type: 'line',
      data: {
        labels: Array.from({ length: powerData.length }, (_, i) => `Data ${i + 1}`),
        datasets: [{
          label: 'Power Output (W)',
          data: powerData,
          borderColor: 'rgba(75, 192, 192, 1)', // Green
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // Green with transparency
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  // Function to update energy storage chart
  function updateEnergyStorageChart() {
    if (energyStorageChart) {
      energyStorageChart.destroy();
    }

    // Limit the number of entries to display
    const labels = Array.from({ length: Math.min(energyData.length, MAX1_ENTRIES) }, (_, i) => `Data ${i + 1}`);
    const data = energyData.slice(Math.max(energyData.length - MAX1_ENTRIES, 0));

    const energyStorageCtx = document.getElementById('energyStorageChart').getContext('2d');
    energyStorageChart = new Chart(energyStorageCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Energy Stored (kWh)',
          data: data,
          backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow with transparency
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
});
