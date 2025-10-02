/**
 * Action Provider - Abstract interface for different action types
 */
class ActionProvider {
    async execute(config) {
        throw new Error('ActionProvider.execute must be implemented');
    }
    
    getName() {
        throw new Error('ActionProvider.getName must be implemented');
    }
}

module.exports = ActionProvider;