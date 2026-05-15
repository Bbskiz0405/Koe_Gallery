/* Pure visual — no motion here, layoutId is on the parent in Scene.jsx */
const ClosedBook = () => (
  <>
    <div className="book-spine" />
    <div className="book-cover">
      <div className="book-cover-inner">
        <h1 className="book-title">心咲koe</h1>
        <div className="book-divider" />
        <span className="book-cherry">🌸</span>
        <p className="book-caption">紀念相簿 2026</p>
      </div>
    </div>
    <div className="book-pages" />
  </>
)

export default ClosedBook
