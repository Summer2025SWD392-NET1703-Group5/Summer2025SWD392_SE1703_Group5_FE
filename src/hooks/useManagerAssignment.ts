import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { cinemaService } from '../services/cinemaService';
import type { Cinema } from '../types/cinema';

interface UseManagerAssignmentReturn {
  isAssigned: boolean;
  assignedCinema: Cinema | null;
  loading: boolean;
  error: string | null;
}

export const useManagerAssignment = (): UseManagerAssignmentReturn => {
  const { user } = useAuth();
  const [isAssigned, setIsAssigned] = useState(false);
  const [assignedCinema, setAssignedCinema] = useState<Cinema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkManagerAssignment = async () => {
      // Only check for managers
      if (user?.role !== 'Manager') {
        setIsAssigned(false);
        setAssignedCinema(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const cinema = await cinemaService.getManagerCinema();
        setIsAssigned(true);
        setAssignedCinema(cinema);
      } catch (error: any) {
        console.log('Manager is not assigned to any cinema:', error.message);
        setIsAssigned(false);
        setAssignedCinema(null);
        setError(error.message || 'Manager is not assigned to any cinema');
      } finally {
        setLoading(false);
      }
    };

    checkManagerAssignment();
  }, [user]);

  return {
    isAssigned,
    assignedCinema,
    loading,
    error
  };
};
