export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="pageHeader">
      <div className="pageHeaderText">
        <div className="pageTitle">{title}</div>
        {subtitle ? <div className="pageSubtitle">{subtitle}</div> : null}
      </div>
      {actions ? <div className="pageHeaderActions">{actions}</div> : null}
    </div>
  )
}

