import { Component, type ErrorInfo, type PropsWithChildren } from 'react'

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uventet appfeil', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#f7f9fc] p-6">
          <section className="case-card w-full max-w-lg p-6">
            <div className="case-status-pill case-status-red">Noe gikk galt</div>
            <p className="case-field mt-4">
              Appen traff en uventet feil. Last siden på nytt for å prøve igjen.
            </p>
            <button
              className="case-action case-action-red mt-5 px-5"
              onClick={() => window.location.reload()}
              type="button"
            >
              Prøv igjen
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
