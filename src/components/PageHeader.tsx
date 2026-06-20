type PageHeaderProps = {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h2 className="text-3xl font-extrabold tracking-normal text-[#1f2f55]">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p>
      ) : null}
    </header>
  )
}
