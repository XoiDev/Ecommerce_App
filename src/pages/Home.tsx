import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { increment, decrement, setValue } from "../store/exampleSlice";

const Home: React.FC = () => {
  const value = useSelector((state: RootState) => state.example.value);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Redux Counter</h1>
      <p>Value: {value}</p>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
      <button onClick={() => dispatch(setValue(10))}>Set to 10</button>
    </div>
  );
};

export default Home;
