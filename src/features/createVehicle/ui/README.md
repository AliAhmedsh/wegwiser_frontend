# Simulation Created Modal

This modal displays a success message when a vehicle simulation is created, informing the user that they need approval from UX and Engineering managers before launching the vehicle.

## Integration

The modal is now integrated into the **main home screen** and will appear automatically when a simulation is created during the vehicle creation process.

## Usage

### Method 1: Using the utility function
```typescript
import { showSimulationCreatedModal } from '@/features/createVehicle/ui/SimulationCreatedModal';

// Show the modal
showSimulationCreatedModal();
```

### Method 2: Using the store directly
```typescript
import { useModalWindowStore } from '@/store/modalWindowsStore';

function MyComponent() {
  const { setSimulationCreated } = useModalWindowStore();
  
  const handleSimulationCreated = () => {
    setSimulationCreated(true);
  };
  
  return (
    <button onClick={handleSimulationCreated}>
      Create Simulation
    </button>
  );
}
```

### Method 3: Automatic trigger in vehicle creation flow
The modal is automatically triggered when users click "Create Vehicle Simulation" in the vehicle creation review step.

## Features

- **Home Screen Integration**: The modal appears on the main home screen when triggered
- **Auto-close**: Clicking outside the modal closes it
- **Responsive Design**: Adapts to different screen sizes
- **Consistent Styling**: Matches the existing design system
- **Global State Management**: Uses Zustand store for state management

## Design

The modal displays:
- Title: "Simulation Created!"
- Message: "You can launch the vehicle after the UX manager and Engineering manager approves the simulation."
- White background with rounded corners
- Semi-transparent overlay

## Flow

1. User completes vehicle creation process
2. Clicks "Create Vehicle Simulation" button
3. "Simulation Created!" popup appears on home screen
4. User clicks outside to close popup
5. Vehicle simulation dashboard is shown

## Testing

To test the modal, you can:
1. Navigate to vehicle creation flow
2. Complete all steps and click "Create Vehicle Simulation"
3. The popup should appear on the home screen
4. Click outside to close and see the simulation dashboard
