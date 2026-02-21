import {
  HookProvider,
  HookRegistry,
  BeforeInvocationEvent,
  AfterInvocationEvent,
  BeforeToolCallEvent,
  AfterToolCallEvent,
} from '@strands-agents/sdk'

/**
 * TelemetryHookProvider logs agent and tool lifecycles for monitoring and debugging.
 */
export class TelemetryHookProvider implements HookProvider {
  /**
   *
   */
  registerCallbacks(registry: HookRegistry): void {
    registry.addCallback(BeforeInvocationEvent, (ev) => this.logRequestStart(ev))
    registry.addCallback(AfterInvocationEvent, (ev) => this.logRequestEnd(ev))
    registry.addCallback(BeforeToolCallEvent, (ev) => this.logToolStart(ev))
    registry.addCallback(AfterToolCallEvent, (ev) => this.logToolEnd(ev))
  }

  private logRequestStart(event: BeforeInvocationEvent): void {
    console.log(`[Telemetry] Agent Invocation Started: Agent (messages: ${event.agent.messages.length})`)
  }

  private logRequestEnd(event: AfterInvocationEvent): void {
    console.log(`[Telemetry] Agent Invocation Completed: Agent (messages: ${event.agent.messages.length})`)
  }

  private logToolStart(event: BeforeToolCallEvent): void {
    console.log(`[Telemetry] Tool Invocation Started: ${event.toolUse.name}`)
  }

  private logToolEnd(event: AfterToolCallEvent): void {
    console.log(
      `[Telemetry] Tool Invocation Completed: ${event.toolUse.name} | Status: ${
        event.result?.status === 'error' ? 'ERROR' : 'SUCCESS'
      }`
    )
  }
}
