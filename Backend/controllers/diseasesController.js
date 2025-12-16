const supabase = require("../config/supabaseClient");


const getAllDiseases = async (req, res) => {
    console.log('gumagana ako diseases')
    try {
        const { data: diseasesData, error: diseasesError } = await supabase.from("diseases").select("*");

        if (diseasesError) {
            console.error("Error getting all diseases");
            return res.status(500).json({ success: false, error: diseasesError.message });
        }
        res.status(200).json({ success: true, data: diseasesData });
        
    } catch (err) {
        console.error(`Something went wrong getting all diseases: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getAllNumberOfDiseases = async (req, res) => {
  try {
    const MIN_POPULATION = 10; // Minimum patients to consider percentage meaningful
    const MIN_CASES = 5;       // Minimum number of cases before alert triggers
    const ALERT_THRESHOLD = 10; // 10% threshold for alarm

    // 1️⃣ Fetch all diagnosis records
    const { data: allRecordsData, error: allRecordsError } = await supabase
      .from("diagnoses")
      .select("disease_id");

    if (allRecordsError) {
      console.error(`Error getting records: ${allRecordsError.message}`);
      return res.status(500).json({ success: false, error: allRecordsError.message });
    }

    // 2️⃣ Fetch total patient population
    const { count: totalPopulation, error: populationError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    if (populationError) {
      console.error(`Error getting population: ${populationError.message}`);
      return res.status(500).json({ success: false, error: populationError.message });
    }

    // 3️⃣ Count cases per disease
    const diseaseCounts = allRecordsData.reduce((acc, record) => {
      acc[record.disease_id] = (acc[record.disease_id] || 0) + 1;
      return acc;
    }, {});

    // 4️⃣ Fetch disease names
    const { data: diseases, error: diseaseError } = await supabase
      .from("diseases")
      .select("id, name");

    if (diseaseError) {
      console.error(`Error getting diseases: ${diseaseError.message}`);
      return res.status(500).json({ success: false, error: diseaseError.message });
    }

    // 5️⃣ Build final analytics with percentage and alert logic
    const result = diseases.map((disease) => {
      const totalCases = diseaseCounts[disease.id] || 0;

      // Check if population is sufficient
      if (totalPopulation < MIN_POPULATION) {
        return {
          disease_id: disease.id,
          disease_name: disease.name,
          total_cases: totalCases,
          percentage: null,
          alert: false,
          status: "INSUFFICIENT_DATA"
        };
      }

      // Calculate percentage
      const percentage = (totalCases / totalPopulation) * 100;

      // Determine if alert should trigger
      const alert = totalCases >= MIN_CASES && percentage >= ALERT_THRESHOLD;

      return {
        disease_id: disease.id,
        disease_name: disease.name,
        total_cases: totalCases,
        percentage: Number(percentage.toFixed(2)),
        alert,
        status: alert ? "ALERT" : "OK"
      };
    });

    // 6️⃣ Sort descending by total_cases
    result.sort((a, b) => b.total_cases - a.total_cases);

    // 7️⃣ Return JSON
    return res.json({
      success: true,
      total_population: totalPopulation,
      data: result,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};



module.exports = {
    getAllDiseases,
    getAllNumberOfDiseases
}