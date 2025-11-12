import { memo } from 'react'
import LazyVideoCard from './LazyVideoCard'

const TemplateGrid = memo(function TemplateGrid({
  sortedCategories,
  selectedTemplate,
  onSelectTemplate,
  categoryPages,
  onCategoryPageChange,
  onTouchStart,
  onTouchEnd,
  templatesPerPage,
  favoriteTemplates,
  onToggleFavorite
}) {
  return (
    <>
      {sortedCategories.map(([category, categoryTemplates]) => {
        const totalPages = Math.max(1, Math.ceil(categoryTemplates.length / templatesPerPage))
        const currentPageForCategory = Math.min(categoryPages[category] || 0, totalPages - 1)
        const startIndex = currentPageForCategory * templatesPerPage
        const visibleTemplates = categoryTemplates.slice(startIndex, startIndex + templatesPerPage)

        return (
          <div key={category} className="category-section">
            <div className="category-header">
              <h3 className="category-title">{category}</h3>
              <div className="category-controls">
                <button
                  className="category-nav-button"
                  onClick={() => onCategoryPageChange(category, -1)}
                  disabled={currentPageForCategory === 0}
                  aria-label={`Previous page for ${category}`}
                >
                  ‹
                </button>
                <span className="category-page-indicator">
                  {currentPageForCategory + 1}/{totalPages}
                </span>
                <button
                  className="category-nav-button"
                  onClick={() => onCategoryPageChange(category, 1)}
                  disabled={currentPageForCategory >= totalPages - 1}
                  aria-label={`Next page for ${category}`}
                >
                  ›
                </button>
              </div>
            </div>
            <div
              className="templates-grid"
              onTouchStart={(event) => onTouchStart(category, event)}
              onTouchEnd={(event) => onTouchEnd(category, event)}
            >
              {visibleTemplates.map((template) => (
                <LazyVideoCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => onSelectTemplate(template)}
                  isFavorited={favoriteTemplates.includes(template.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
})

export default TemplateGrid

