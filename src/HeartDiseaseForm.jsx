import React, { useState, useEffect } from "react";
import { Button, Box, FormControl, FormLabel, Input, Select, Small, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';

const HeartDiseaseForm = () => {
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const userEmail = sessionStorage.getItem("userEmail");
    if (userEmail) {
      setUserEmail(userEmail);
    }
  }, []);

  const steps = [
    {
      label: "Step 1: Personal Information",
      fields: ["age", "sex"],
    },
    {
      label: "Step 2: Medical History",
      fields: ["cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang"],
    },
    {
      label: "Step 3: Exercise Information",
      fields: ["oldpeak", "slope", "ca", "thal"],
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const currentFields = steps[currentStep].fields;

  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const chestPainOptions = [
    { name: "Typical angina", value: "0" },
    { name: "Atypical angina", value: "1" },
    { name: "Non-anginal pain", value: "2" },
    { name: "Asymptomatic", value: "3" },
  ];

  const restecgOptions = [
    { name: "Nothing to note", value: "0" },
    { name: "ST-T Wave abnormality", value: "1" },
    {
      name: "Possible or definite left ventricular hypertrophy, Enlarged heart's main pumping",
      value: "2",
    },
  ];

  const slopeOptions = [
    {
      name: "Upsloping: better heart rate with exercise (uncommon)",
      value: "0",
    },
    { name: "Flatsloping: minimal change (typical healthy heart)", value: "1" },
    { name: "Downsloping: signs of unhealthy heart", value: "2" },
  ];

  const caOptions = [
    { name: "0", value: "0" },
    { name: "1", value: "1" },
    { name: "2", value: "2" },
    { name: "3", value: "3" },
  ];

  const thalOptions = [
    { name: "Normal (1-3)", value: "1" },
    {
      name: "Fixed Defect: Used to be defect but OK now (around 6)",
      value: "2",
    },
    {
      name: "Reversible Defect: No proper blood movement when exercising (thal is 7)",
      value: "3",
    },
  ];

  // Define mapping objects for select options
  const optionsMapping = {
    cp: chestPainOptions,
    restecg: restecgOptions,
    slope: slopeOptions,
    ca: caOptions,
    thal: thalOptions,
  };

  // Define your formData state with default values as empty strings
  const [formData, setFormData] = useState({
    age: "",
    sex: "", // Default value is an empty string
    cp: "", // Default value is an empty string
    trestbps: "", // Default value is an empty string
    chol: "", // Default value is an empty string
    fbs: "",
    restecg: "",
    thalach: "",
    exang: "",
    oldpeak: "",
    slope: "",
    ca: "",
    thal: "",
  });

  // Define a separate userData state for string values
  const [userData, setUserData] = useState({
    age: "",
    sex: "",
    cp: "",
    trestbps: "",
    chol: "",
    fbs: "",
    restecg: "",
    thalach: "",
    exang: "",
    oldpeak: "",
    slope: "",
    ca: "",
    thal: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Fetch the selected option's string value
    let selectedOptionValue = "";
    if (optionsMapping[name]) {
      const selectedOption = optionsMapping[name].find((option) => option.value === value);
      if (selectedOption) {
        selectedOptionValue = selectedOption.name;
      }
    }
  
    // Update both formData and userData
    setFormData({ ...formData, [name]: value });
    setUserData({ ...userData, [name]: selectedOptionValue || value });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("User Data -> ", userData)
    console.log("Form Data -> ", formData)


    // Create a data object in the required format
    const dataToSend = {
      features: [
        [
          formData.age,
          formData.sex,
          formData.cp,
          formData.trestbps,
          formData.chol,
          formData.fbs,
          formData.restecg,
          formData.thalach,
          formData.exang,
          formData.oldpeak,
          formData.slope,
          formData.ca,
          formData.thal,
        ],
      ],
    };

    const DBdata = {
      email: userEmail,
      userReport: {
      age: userData.age,
      sex: userData.sex === 1 ? "Male" : "Female",
      chestPainType: userData.cp,
      restingBloodPressure: userData.trestbps,
      serumCholesterol: userData.chol,
      fastingBloodSugar: userData.fbs,
      restingElectrocardiographicResults: userData.restecg,
      maxHeartRateAchieved: userData.thalach,
      exerciseInducedPain: userData.exang === 1 ? "Yes" : "No",
      stDepressionInducedByExercise: userData.oldpeak,
      slopeOfPeakExerciseSTSegment: userData.slope,
      numMajorVesselsColoredByFluoroscopy: userData.ca,
      thaliumStressResult: userData.thal
    }}

    try {
      // Make a POST request to your Flask API
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const savetoDB = await fetch("http://localhost:8000/save_report",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(DBdata),
      })
      if (!savetoDB.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      const prediction = responseData.prediction[0];

      // Reset the form data to its initial state (empty values)
      setFormData({
        age: "",
        sex: "",
        cp: "",
        trestbps: "",
        chol: "",
        fbs: "",
        restecg: "",
        thalach: "",
        exang: "",
        oldpeak: "",
        slope: "",
        ca: "",
        thal: "",
      });

      // Reset the userData state as well
      setUserData({
        age: "",
        sex: "",
        cp: "",
        trestbps: "",
        chol: "",
        fbs: "",
        restecg: "",
        thalach: "",
        exang: "",
        oldpeak: "",
        slope: "",
        ca: "",
        thal: "",
      });

      // Display a message based on the prediction result
      if (prediction === 0) {
        // Prediction is 0, indicating no heart disease
        alert("You are safe. No heart disease detected.");
      } else if (prediction === 1) {
        // Prediction is 1, indicating potential heart disease
        alert("You might need further assistance. Potential heart disease detected.");
      }

      // Handle the API response as needed
      // You can update the state or perform any other actions here
    } catch (error) {
      console.error("Error:", error);
      // Handle errors here, e.g., display an error message to the user
    }
  };

  const handleNext = () =>{
    navigate('/doctors');
  }

  const cholMessage =
    "Serum cholesterol (chol) is typically measured in mg/dL. Values above 200 mg/dL are typically a cause for concern.";
  const fbsMessage =
    "Fasting blood sugar (fbs) is typically measured in mg/dL. A value above 126 mg/dL signals diabetes.";
  const oldpeakMessage =
    "ST Depression Induced by Exercise Relative to Rest (oldpeak) typically ranges from 0.0 to 4.0.";

  return (
    <div style={{ background: 'linear-gradient(to left, #ff5757, #8c52ff)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px'}}>
    <Box 
      // w={['full', 'full', 'full', 'full']}
      w={['80%']}
      // p={[8, 10]}
      // m={[10, 10]}
      // mt={[20, '10vh']}
      // mb={[20, '10vh']}
      // mx='auto'
      m='auto'

      bg="rgba(255, 255, 255, 0.2)" // Transparent white background
      backdropFilter="blur(10px)" // Apply a blur effect
      borderRadius="10px" // Rounded corners for the glass container
      p="20px" // Adjust padding as needed
      // w="300px" // Set width as needed
      mx="auto" // Center the container horizontally
      
      border={['none', '1px']}
      borderColor={['', 'gray.300']}
      // borderRadius={10}
    >
      <form onSubmit={handleSubmit} >
        <Stack spacing={5} ml={100} mr={100} mt={20} mb={10}>
          {currentStep === 0 && <Text fontSize="2rem" color="white.500">Step 1: Personal Information</Text>}
          {currentStep === 0 && 
          <div>
            <FormControl>
              <FormLabel color="white">Age:</FormLabel>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                // variant="filled"
                />
            </FormControl>

            <FormControl>
              <FormLabel color="white">Sex:</FormLabel>
              <Select name="sex" value={formData.sex} onChange={handleChange}>
                <option value="">Select your gender</option>
                <option value="1">Male</option>
                <option value="0">Female</option>
              </Select>
            </FormControl>
          </div>
          }

          { currentStep === 1 && <Text fontSize="2rem" color="white.500">Step 2: Medical History</Text> }
          { currentStep === 1 &&
          <div>
            <FormControl>
              <FormLabel color="white">Chest Pain Type:</FormLabel>
              <Select name="cp" value={formData.cp} onChange={handleChange}>
                <option value="">Select chest pain type</option>
                {chestPainOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="white">Resting Blood Pressure (trestbps in mm Hg):</FormLabel>
              <Input
                type="number"
                name="trestbps"
                max="300"
                value={formData.trestbps}
                onChange={handleChange}
                />
              <Text fontSize="sm" color="gray.600">above 130-140 is typically cause for concern</Text>
            </FormControl>

            <FormControl>
              <FormLabel color="white">Serum Cholesterol (chol in mg/dL):</FormLabel>
              <Input
                type="number"
                name="chol"
                value={formData.chol}
                onChange={handleChange}
                />
              <Text fontSize="sm" color="gray.600">above 200 is cause for concern</Text>
            </FormControl>

            <FormControl>
              <FormLabel color="white">Fasting Blood Sugar (fbs in mg/dL):</FormLabel>
              <Input
                type="number"
                name="fbs"
                value={formData.fbs}
                onChange={handleChange}
              />
              <Text fontSize="sm" color="gray.600">{fbsMessage}</Text>
            </FormControl>

            <FormControl>
              <FormLabel color="white">Resting Electrocardiographic Results:</FormLabel>
              <Select
                name="restecg"
                value={formData.restecg}
                onChange={handleChange}
              >
                <option value="">Select resting ECG results</option>
                {restecgOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </div>
          }

          { currentStep === 2 && <Text fontSize="2rem" color="white.500">Step 3: Exercise Information</Text> }
          { currentStep === 2 &&
          <div>
            <FormControl>
              <FormLabel color="white">
                Maximum Heart Rate Achieved (thalach in beats per minute):
              </FormLabel>
              <Input
                type="number" 
                name="thalach"
                max="400"
                value={formData.thalach}
                onChange={handleChange}
                />
              <Text fontSize="sm" color="gray.600">Can have maximum value of 400</Text>
            </FormControl>

            <FormControl>
              <FormLabel color="white">Exercise-Induced Pain (exang):</FormLabel>
              <Select name="exang" value={formData.exang} onChange={handleChange}>
                <option value="">Select</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="white">
                ST Depression Induced by Exercise (oldpeak):
              </FormLabel>
              <Input
                type="number"
                name="oldpeak"
                min="0" 
                max="4"
                step="0.1"
                value={formData.oldpeak}
                onChange={handleChange}
                />
              <Text fontSize="sm" color="gray.600">{oldpeakMessage}</Text>
            </FormControl>

            <FormControl>
              <FormLabel color="white">Slope of the Peak Exercise ST Segment:</FormLabel>
              <Select name="slope" value={formData.slope} onChange={handleChange}>
                <option value="">Select slope</option>
                {slopeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </FormControl>
                  
            <FormControl>
              <FormLabel color="white">
                Number of Major Vessels Colored by Fluoroscopy (ca):
              </FormLabel>
              <Select name="ca" value={formData.ca} onChange={handleChange}>
                <option value="">Select ca</option>
                {caOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel color="white">Thalium Stress Result (thal):</FormLabel>
              <Select name="thal" value={formData.thal} onChange={handleChange}>
                <option value="">Select thal</option>
                {thalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </div>
          }

          {currentStep > 0 && (
            <Button
              type="button"
              colorScheme="blue"
              background="blueviolet"
              onClick={() => setCurrentStep(currentStep - 1)}
              >
              Previous
            </Button>
          )}

          {!isLastStep && (

            <Button
            type="button"
            colorScheme="teal"
            background="mediumvioletred"
            onClick={nextStep}
            >
            Next
          </Button>
              )}
          {isLastStep && 
          (<Button
            type="submit"
            colorScheme="teal"
            >
            {isLastStep ? "Predict" : ""}
          </Button>)
          }
          
          {isLastStep && (
            <Button
              type="button"
              colorScheme="blue"
              onClick={() => navigate("/doctors")}
            >
              Connect to doctor
            </Button>
          )}
          
          {/* <Button type="submit" colorScheme="teal">Predict</Button>
          <Button onClick={handleNext} colorScheme="blue">Connect to doctor</Button> */}
        </Stack>
      </form>
    </Box>
    </div>
  );
};

export default HeartDiseaseForm;