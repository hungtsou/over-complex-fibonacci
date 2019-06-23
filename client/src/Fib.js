import React, { useState, useEffect } from "react";
import axios from "axios";

const Fib = () => {
  const [values, setValues] = useState({});
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [index, setIndex] = useState("");

  useEffect(() => {
    fetchValues();
    fetchSeenIndexes();
  }, []);

  const fetchValues = async () => {
    const values = await axios.get("/api/values/current");
    setValues(values.data);
  };

  const fetchSeenIndexes = async () => {
    const indexes = await axios.get("/api/values/all");
    setSeenIndexes(indexes.data);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    console.log("hoa prro");

    await axios.post("/api/values", {
      index
    });
    setIndex("");
  };

  const renderSeenIndexes = () =>
    seenIndexes.map(({ number }) => number).join(", ");

  const renderValues = () => {
    Object.values(values).map((value, i) => (
      <div key={i}>
        For index {i} I calculated {value}
      </div>
    ));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input value={index} onChange={event => setIndex(event.target.value)} />
        <button>Submit</button>
      </form>

      <h3>Indexes I have seen:</h3>
      {renderSeenIndexes()}

      <h3>Calculated Values:</h3>
      {renderValues()}
    </div>
  );
};

export default Fib;
