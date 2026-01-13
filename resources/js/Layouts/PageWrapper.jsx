import React from "react";

const PageWrapper = ({children}) => {
    return <div className="flex-col space-y-2 flex-grow ml-5">{children}</div>;
};

export default PageWrapper;