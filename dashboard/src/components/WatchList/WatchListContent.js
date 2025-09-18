import WatchListItem from './WatchListItem';

const WatchListContent = ({ stocks, currentPage, onNextPage, onPreviousPage, isSearchResults }) => {
  return (
    <>
      <ul className="list">
        {stocks.map((stock, index) => (
          <WatchListItem 
            stock={stock} 
            key={`${stock.symbol}-${index}`} 
          />
        ))}
      </ul>

      {!isSearchResults && (
        <div className="pagination-container">
          <button 
            onClick={onPreviousPage}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            Previous 50
          </button>
          <span className="page-info">
            Page {currentPage + 1} of 2
          </span>
          <button 
            onClick={onNextPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Next 50
          </button>
        </div>
      )}
    </>
  );
};

export default WatchListContent;
