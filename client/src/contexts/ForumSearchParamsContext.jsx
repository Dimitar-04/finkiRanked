// import { createContext, useContext, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// const ForumSearchParamsContext = createContext();

// export const ForumSearchParamsProvider = ({ children }) => {
//   const [searchParams, setSearchParams] = useSearchParams();

//   return (
//     <ForumSearchParamsContext.Provider
//       value={{
//         forumSearchParams: searchParams,
//         setForumSearchParams: setSearchParams,
//       }}
//     >
//       {children}
//     </ForumSearchParamsContext.Provider>
//   );
// };

// export const useForumSearchParams = () => useContext(ForumSearchParamsContext);
