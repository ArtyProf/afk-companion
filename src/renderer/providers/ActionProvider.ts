interface ActionResult {
    success: boolean;
    message: string;
    timestamp: string;
}

/**
 * Action Provider - Abstract interface for different action types
 */
export abstract class ActionProvider {
    abstract execute(config: any): Promise<ActionResult>;
    abstract getName(): string;
}

export type { ActionResult };