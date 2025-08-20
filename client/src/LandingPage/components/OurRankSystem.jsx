import React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RANK_DATA } from '../../utils/rankUtils';

export const OurRankSystem = () => {
  const rankData = Object.values(RANK_DATA).sort((a, b) => a.id - b.id);

  return (
    <>
      <style>
        {`
          @keyframes breathe {
            0%, 100% {
              filter: drop-shadow(0 0 3px var(--glow-color));
            }
            50% {
              filter: drop-shadow(0 0 8px var(--glow-color));
            }
          }
          .breathing-glow {
            animation: breathe 2.5s ease-in-out infinite;
          }
        `}
      </style>
      <div
        data-theme="luxury"
        className="dashboard bg-base-200 flex overflow-none py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-12"
      >
        <div className="flex w-full flex-col justify-center items-center gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
            Our Ranking System
          </h1>
          <p className="text-sm sm:text-base lg:text-base text-center max-w-xl">
            Climb the ranks and show your coding prowess! Each rank represents
            your dedication and skill level in competitive programming.
          </p>

          <div className="rounded-box border border-base-content/5 bg-base-100 w-full max-w-5xl p-3 sm:p-4 lg:p-6 overflow-x-auto">
            <table className="table table-xs sm:table-sm lg:table-md w-full">
              <thead>
                <tr>
                  <th className="text-xs sm:text-sm">Rank #</th>
                  <th className="text-xs sm:text-sm">Title</th>
                  <th className="text-xs sm:text-sm">Required Points</th>
                  <th className="text-xs sm:text-sm">Icon</th>
                </tr>
              </thead>
              <tbody>
                {rankData.map((rank) => {
                  const isGlowing = rank.id >= 4;

                  return (
                    <tr key={rank.id} className="hover">
                      <th className="text-xs sm:text-sm">{rank.id}</th>
                      <td className="font-medium text-xs sm:text-sm">
                        {rank.title}
                      </td>
                      <td className="font-mono font-bold text-xs sm:text-sm">
                        <span className="hidden sm:inline">
                          {rank.requiredPoints.toLocaleString()} pts
                        </span>
                        <span className="sm:hidden">
                          {rank.requiredPoints.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${
                            isGlowing ? 'breathing-glow' : ''
                          }`}
                          viewBox="0 0 24 24"
                          fill={rank.color || '#FFFFFF'}
                          xmlns="http://www.w3.org/2000/svg"
                          style={
                            isGlowing
                              ? {
                                  '--glow-color': rank.color,
                                }
                              : {}
                          }
                        >
                          <path d="M12 22L2 15.5V2H22V15.5L12 22Z" />
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-center text-base-content/70 max-w-3xl w-full">
            <p className="mb-3 text-sm sm:text-base font-semibold">
              How to earn points:
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="bg-base-100 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Early bird gets the worm
                </h3>
                <p>
                  Solve the challenges as early as you can every day. Remember
                  they start 7 AM sharp
                </p>
              </div>
              <div className="bg-base-100 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  As few attempts as possible
                </h3>
                <p>
                  Every additional attempt on the excercise earns you less
                  points
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
