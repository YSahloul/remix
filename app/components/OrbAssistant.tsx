import React from "react";
import Orb from "./Orb";
import { useVapiContext } from "~/contexts/VapiContext";
import { CALL_STATUS } from "~/hooks/useVapi";

const OrbAssistant: React.FC = () => {
  const { state } = useVapiContext();
  const { callStatus } = state;

  const orbContainerStyle: React.CSSProperties = {
    width: "150px",
    height: "150px",
    position: "relative",
    cursor: "pointer",
  };

  const statusIndicatorStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "-25px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "bold",
    textAlign: "center",
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case CALL_STATUS.ACTIVE:
        return "bg-red-500";
      case CALL_STATUS.LOADING:
        return "bg-orange-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CALL_STATUS.ACTIVE:
        return "Active";
      case CALL_STATUS.LOADING:
        return "Loading";
      default:
        return "Inactive";
    }
  };

  return (
    <div style={orbContainerStyle}>
      <Orb />
      <div
        style={statusIndicatorStyle}
        className={`${getStatusColor()} text-white`}
      >
        {getStatusText()}
      </div>
    </div>
  );
};

export { OrbAssistant };
