import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-white">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 justify-center items-center">
            <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-8">
              <AlertTriangle size={48} color="#EF4444" />
            </View>
            
            <Text className="text-text-primary font-black text-3xl text-center mb-4 tracking-tighter uppercase italic">
              Something went wrong
            </Text>
            
            <Text className="text-text-secondary font-bold text-center mb-10 leading-6 text-lg">
              We encountered an unexpected error. Our team has been notified. Try refreshing the app.
            </Text>

            <View className="w-full space-y-4">
              <TouchableOpacity 
                onPress={this.handleReset}
                className="bg-brand-primary w-full py-5 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-brand-primary/40"
              >
                <RefreshCw size={20} color="#FFF" />
                <Text className="text-white font-black ml-3 uppercase">Try Again</Text>
              </TouchableOpacity>

              <View className="bg-gray-50 border border-gray-100 p-6 rounded-[32px] mt-8 w-full">
                <Text className="text-gray-400 font-black text-[10px] uppercase mb-2 tracking-widest">Error Logs (Tech Only)</Text>
                <Text className="text-gray-500 font-mono text-[10px]" numberOfLines={4}>
                  {this.state.error?.message || 'Unknown Runtime Error'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
