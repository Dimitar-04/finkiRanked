import Navbar from '@/Dashboard/components/Navbar';
import React from 'react';

const LeaderBoardEx = () => {
  return (
    <div
      data-theme="luxury"
      className="dashboard h-screen flex bg-base-100 overflow-none"
    >
      <Navbar></Navbar>
      <div className="flex w-full flex-col justify-center items-center p-20 gap-10">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-1/2">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Rank</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              <tr>
                <th>1</th>
                <td>John Smith</td>
                <td>Diamond</td>
                <td>2500</td>
              </tr>
              {/* row 2 */}
              <tr>
                <th>2</th>
                <td>Sarah Johnson</td>
                <td>Platinum</td>
                <td>2300</td>
              </tr>
              {/* row 3 */}
              <tr>
                <th>3</th>
                <td>Michael Brown</td>
                <td>Gold</td>
                <td>2100</td>
              </tr>
              {/* row 4 */}
              <tr>
                <th>4</th>
                <td>Emily Davis</td>
                <td>Silver</td>
                <td>1900</td>
              </tr>
              {/* row 5 */}
              <tr>
                <th>5</th>
                <td>David Wilson</td>
                <td>Bronze</td>
                <td>1700</td>
              </tr>
              {/* row 6 */}
              <tr>
                <th>6</th>
                <td>Lisa Anderson</td>
                <td>Bronze</td>
                <td>1500</td>
              </tr>
              {/* row 7 */}
              <tr>
                <th>7</th>
                <td>Robert Taylor</td>
                <td>Bronze</td>
                <td>1300</td>
              </tr>
              {/* row 8 */}
              <tr>
                <th>8</th>
                <td>Jennifer Martinez</td>
                <td>Bronze</td>
                <td>1100</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="btn btn-lg">Load more</button>
      </div>
    </div>
  );
};

export default LeaderBoardEx;
