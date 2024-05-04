export  const getUniqueDatesFromArray = (data) => {
    const uniqueDates = new Set();
    data.forEach(item => {
        if(item.date) {
            uniqueDates.add(item.date);
        }
    });
    return Array.from(uniqueDates); 
};
