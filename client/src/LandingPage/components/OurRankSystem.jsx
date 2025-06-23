import React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { RANK_DATA } from "../../utils/rankUtils";

export const OurRankSystem = () => {
  const rankData = Object.values(RANK_DATA).sort((a, b) => a.id - b.id);

  return (
    <div
      data-theme="luxury"
      className="dashboard bg-base-200 flex overflow-none p-20"
    >
      <div className="flex w-full flex-col justify-center items-center p-20 gap-10">
        <h1 className="text-4xl font-bold">Our Ranking System</h1>
        <p className="text-lg text-center max-w-2xl">
          Climb the ranks and show your coding prowess! Each rank represents
          your dedication and skill level in competitive programming.
        </p>

        <div className="rounded-box border border-base-content/5 bg-base-100 w-full max-w-4xl p-10">
          <table className="table">
            <thead>
              <tr>
                <th>Rank #</th>
                <th>Title</th>
                <th>Required Points</th>
                <th>Icon</th>
              </tr>
            </thead>
            <tbody>
              {rankData.map((rank) => (
                <tr key={rank.id} className="hover">
                  <th>{rank.id}</th>
                  <td className="font-medium">{rank.title}</td>
                  <td className="font-mono font-bold">
                    {rank.requiredPoints.toLocaleString()} pts
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <img
                        src={rank.icon}
                        alt={rank.title}
                        className="w-8 h-8"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center text-base-content/70 max-w-2xl">
          <p className="mb-4">
            <strong>How to earn points:</strong>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-base-100 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Early bird gets the worm</h3>
              <p>
                Solve the challenges as early as you can every day. Remember
                they start 7 AM sharp
              </p>
            </div>
            <div className="bg-base-100 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">
                As few attempts as possible
              </h3>
              <p>
                Every additional attempt on the excercise earns you less points
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
