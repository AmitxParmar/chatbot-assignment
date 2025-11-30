import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import type { Conversation, Message, SaveMessageParams } from '@/types/chat.types';

// Query keys for cache management
export const chatKeys = {
    all: ['chat'] as const,
    conversations: () => [...chatKeys.all, 'conversations'] as const,
    conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
    messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

/**
 * Hook to fetch all conversations
 */
export const useGetConversations = () => {
    return useQuery<Conversation[]>({
        queryKey: chatKeys.conversations(),
        queryFn: chatService.getAllConversations,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to fetch chat history for a specific conversation
 */
export const useGetChatHistory = (conversationId: string, enabled = true) => {
    return useQuery<Message[]>({
        queryKey: chatKeys.messages(conversationId),
        queryFn: () => chatService.getChatHistory(conversationId),
        enabled: enabled && !!conversationId,
        staleTime: 1000 * 30, // 30 seconds
    });
};


/**
 * Hook to save a message to a conversation
 */
export const useSaveMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: SaveMessageParams) =>
            chatService.saveMessage(params),
        onMutate: async (params: SaveMessageParams) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: chatKeys.messages(params.conversationId) });

            // Snapshot the previous value
            const previousMessages = queryClient.getQueryData<Message[]>(chatKeys.messages(params.conversationId));

            // Optimistically update to the new value
            if (previousMessages) {
                const optimisticMessage: Message = {
                    id: `temp-${Date.now()}`,
                    conversationId: params.conversationId,
                    role: params.role,
                    message: params.message,
                    createdAt: new Date(),
                };

                queryClient.setQueryData<Message[]>(
                    chatKeys.messages(params.conversationId),
                    [...previousMessages, optimisticMessage]
                );
            }

            // Return a context object with the snapshotted value
            return { previousMessages, conversationId: params.conversationId };
        },
        onSuccess: (newMessage: Message, variables) => {
            // Invalidate and refetch messages for this conversation
            queryClient.invalidateQueries({ queryKey: chatKeys.messages(variables.conversationId) });

            // Also invalidate conversations list to update lastMessage
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        },
        onError: (error, variables, context) => {
            console.error('Error saving message:', error);

            // Rollback to the previous value if mutation fails
            if (context?.previousMessages) {
                queryClient.setQueryData(
                    chatKeys.messages(context.conversationId),
                    context.previousMessages
                );
            }
        },
    });
};

/**
 * Hook to toggle AI enabled status for a conversation
 */
export const useToggleAI = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conversationId, aiEnabled }: { conversationId: string; aiEnabled: boolean }) => {
            console.log('Mutation function called:', { conversationId, aiEnabled });
            return chatService.toggleAI(conversationId, aiEnabled);
        },
        onMutate: async ({ conversationId, aiEnabled }) => {
            console.log('onMutate called:', { conversationId, aiEnabled });
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: chatKeys.conversations() });

            // Snapshot the previous value
            const previousConversations = queryClient.getQueryData<Conversation[]>(chatKeys.conversations());

            // Optimistically update to the new value
            if (previousConversations) {
                queryClient.setQueryData<Conversation[]>(
                    chatKeys.conversations(),
                    previousConversations.map(conv =>
                        conv.id === conversationId ? { ...conv, aiEnabled } : conv
                    )
                );
            }

            // Return a context object with the snapshotted value
            return { previousConversations };
        },
        onSuccess: () => {
            // Invalidate and refetch conversations
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
        },
        onError: (error, variables, context) => {
            console.error('Error toggling AI:', error);

            // Rollback to the previous value if mutation fails
            if (context?.previousConversations) {
                queryClient.setQueryData(
                    chatKeys.conversations(),
                    context.previousConversations
                );
            }
        },
    });
};

