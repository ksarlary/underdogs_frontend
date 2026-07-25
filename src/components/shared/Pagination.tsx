type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="pagination" aria-label="Pagination">
      <button
        className="secondary-button"
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 0}
      >
        Précédent
      </button>

      <span className="pagination-status">
        Page {page + 1} sur {totalPages}
      </span>

      <button
        className="secondary-button"
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= totalPages}
      >
        Suivant
      </button>
    </div>
  )
}

export default Pagination
